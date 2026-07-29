import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, FileText, X } from "lucide-react";

import { FollowUpsHeader } from "@/components/followups/FollowUpsHeader";
import { FollowUpMetricsRow } from "@/components/followups/FollowUpMetricsRow";
import { FollowUpViewTabs, type FollowUpView } from "@/components/followups/FollowUpViewTabs";
import { FollowUpFilters, type ChannelFilter } from "@/components/followups/FollowUpFilters";
import { FollowUpTaskList, type GroupMode } from "@/components/followups/FollowUpTaskList";
import { FollowUpDetailPanel } from "@/components/followups/FollowUpDetailPanel";
import { LogFollowUpDrawer } from "@/components/followups/LogFollowUpDrawer";
import { followUpMetrics, followUpTasks as initialFollowUpTasks } from "@/data/mockData";
import type { FollowUpOutcome, FollowUpTask, FollowUpTimeSlot } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

const OUTCOME_LABELS: Record<FollowUpOutcome, string> = {
  spoke_to_client: "Spoke to Client",
  left_message: "Left Message",
  revision_requested: "Revision Requested",
  approved: "Approved",
  declined: "Declined",
};

export function FollowUps() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<FollowUpTask[]>(initialFollowUpTasks);
  const [activeView, setActiveView] = useState<FollowUpView>("today");
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialFollowUpTasks.find((t) => t.dateLabel === "Today")?.id ??
      initialFollowUpTasks[0]?.id ??
      null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: string[] = [];
    for (const task of tasks) {
      if (!seen.has(task.dateLabel)) {
        seen.add(task.dateLabel);
        options.push(task.dateLabel);
      }
    }
    return options;
  }, [tasks]);

  const searchFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        q.length === 0 ||
        task.customerName.toLowerCase().includes(q) ||
        task.quoteNumber.toLowerCase().includes(q) ||
        (task.assignedStaff?.name.toLowerCase().includes(q) ?? false);

      const matchesChannel = channelFilter === "all" || task.channel === channelFilter;
      const matchesDate = !dateFilter || task.dateLabel === dateFilter;

      return matchesSearch && matchesChannel && matchesDate;
    });
  }, [tasks, search, channelFilter, dateFilter]);

  const viewFiltered = useMemo(() => {
    if (activeView === "today") {
      return searchFiltered.filter((t) => t.dateLabel === "Today" && !t.completed);
    }
    if (activeView === "upcoming") {
      return searchFiltered.filter(
        (t) => t.dateLabel !== "Today" && t.timeSlot !== "overdue" && !t.completed
      );
    }
    if (activeView === "overdue") {
      return searchFiltered.filter((t) => t.timeSlot === "overdue" && !t.completed);
    }
    return searchFiltered;
  }, [searchFiltered, activeView]);

  const groupBy: GroupMode =
    activeView === "today" ? "timeSlot" : activeView === "upcoming" ? "date" : "none";

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  function handleReschedule(id: string, dateLabel: string, time: string, timeSlot: FollowUpTimeSlot) {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dateLabel, scheduledTime: time, timeSlot } : t))
    );
    addToast(
      "Follow-up Rescheduled",
      `${target?.quoteNumber ?? id} moved to ${dateLabel}, ${time}.`,
      "info"
    );
  }

  function handleMarkComplete(task: FollowUpTask) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              completed: true,
              statusTag: "completed",
              conversation: [
                ...t.conversation,
                {
                  id: `fuc-${Date.now()}`,
                  date: "Today",
                  label: "Marked Complete",
                  detail: "Follow-up closed out.",
                },
              ],
            }
          : t
      )
    );
    addToast("Follow-up Completed", `${task.quoteNumber} marked as complete.`);
  }

  function handleCreateRevision(task: FollowUpTask) {
    navigate("/quotations", { state: { fromFollowUp: task } });
  }

  function handleScheduleNext(
    task: FollowUpTask,
    outcome: FollowUpOutcome | null,
    note: string,
    nextDateLabel: string
  ) {
    const outcomeLabel = outcome ? OUTCOME_LABELS[outcome] : "Follow-up Logged";
    const isClosing = outcome === "approved" || outcome === "declined";

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              dateLabel: nextDateLabel,
              statusTag: isClosing
                ? "completed"
                : outcome === "revision_requested"
                ? "revision_requested"
                : "pending_call",
              completed: isClosing,
              conversation: [
                ...t.conversation,
                {
                  id: `fuc-${Date.now()}`,
                  date: "Today",
                  label: outcomeLabel,
                  detail: note.trim() || "No additional notes.",
                },
              ],
            }
          : t
      )
    );
    addToast("Follow-up Logged", `${task.quoteNumber} updated. Next check-in on ${nextDateLabel}.`);
  }

  function handleCreateNewFollowUp(task: FollowUpTask) {
    setTasks((prev) => [task, ...prev]);
    setSelectedTaskId(task.id);
    setDrawerOpen(false);
    addToast(
      "Follow-up Logged",
      `New follow-up scheduled for ${task.customerName} (${task.quoteNumber}).`
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                t.type === "info"
                  ? "bg-info-light text-info"
                  : t.type === "warning"
                  ? "bg-warning-light text-warning"
                  : "bg-success-light text-success"
              }`}
            >
              {t.type === "info" ? (
                <FileText className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <FollowUpsHeader
          dateOptions={dateOptions}
          selectedDate={dateFilter}
          onSelectDate={setDateFilter}
          onLogNewFollowUp={() => setDrawerOpen(true)}
        />

        <FollowUpMetricsRow
          dueToday={followUpMetrics.dueToday.value}
          highPriority={followUpMetrics.dueToday.highPriority}
          pendingQuotesCount={followUpMetrics.pendingQuotes.value}
          pendingQuotesValue={followUpMetrics.pendingQuotes.totalValue}
          avgConversionDays={followUpMetrics.avgConversionDays}
          overdueCount={followUpMetrics.overdue.value}
        />

        <FollowUpViewTabs activeView={activeView} onViewChange={setActiveView} />

        <FollowUpFilters
          search={search}
          onSearchChange={setSearch}
          channelFilter={channelFilter}
          onChannelFilterChange={setChannelFilter}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
          <div className="lg:col-span-6">
            <FollowUpTaskList
              tasks={viewFiltered}
              groupBy={groupBy}
              selectedTaskId={selectedTaskId}
              onSelectTask={(task) => setSelectedTaskId(task.id)}
              onReschedule={handleReschedule}
            />
          </div>
          <div className="lg:col-span-4">
            <FollowUpDetailPanel
              task={selectedTask}
              onMarkComplete={handleMarkComplete}
              onCreateRevision={handleCreateRevision}
              onScheduleNext={handleScheduleNext}
            />
          </div>
        </div>
      </div>

      <LogFollowUpDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreate={handleCreateNewFollowUp}
      />
    </>
  );
}
