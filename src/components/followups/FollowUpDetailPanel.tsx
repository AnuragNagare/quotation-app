import { useEffect, useState } from "react";
import { ListTodo } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FollowUpStatusTag } from "@/components/followups/FollowUpStatusTag";
import { formatDisplayDate } from "@/lib/format";
import type { FollowUpOutcome, FollowUpTask } from "@/types";

const OUTCOME_OPTIONS: { value: FollowUpOutcome; label: string }[] = [
  { value: "spoke_to_client", label: "Spoke to Client" },
  { value: "left_message", label: "Left Message" },
  { value: "revision_requested", label: "Revision Requested" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
];

interface FollowUpDetailPanelProps {
  task: FollowUpTask | null;
  onMarkComplete: (task: FollowUpTask) => void;
  onCreateRevision: (task: FollowUpTask) => void;
  onScheduleNext: (task: FollowUpTask, outcome: FollowUpOutcome | null, note: string, nextDateLabel: string) => void;
}

export function FollowUpDetailPanel({
  task,
  onMarkComplete,
  onCreateRevision,
  onScheduleNext,
}: FollowUpDetailPanelProps) {
  const [outcome, setOutcome] = useState<FollowUpOutcome | "">("");
  const [note, setNote] = useState("");
  const [nextDate, setNextDate] = useState("");

  useEffect(() => {
    setOutcome("");
    setNote("");
    setNextDate("");
  }, [task?.id]);

  if (!task) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
          <ListTodo className="size-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-charcoal">Select a follow-up</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
            Choose a task from the list to view its conversation history and log an update.
          </p>
        </div>
      </Card>
    );
  }

  const canCreateRevision = outcome === "revision_requested";

  function handleScheduleNext() {
    if (!nextDate || !task) return;
    onScheduleNext(task, outcome || null, note, formatDisplayDate(nextDate));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="items-start">
          <div>
            <CardTitle>Follow-up Activity: {task.quoteNumber}</CardTitle>
            <p className="mt-0.5 text-xs text-muted">
              {task.customerName} · {task.eventName}
            </p>
          </div>
          <FollowUpStatusTag status={task.statusTag} />
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {task.conversation.map((entry, idx) => (
            <div key={entry.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-2.5 shrink-0 rounded-full bg-gold" />
                {idx !== task.conversation.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-cream-soft" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-bold text-charcoal">
                  {entry.date} — {entry.label}
                </p>
                <p className="text-xs text-muted">{entry.detail}</p>
              </div>
            </div>
          ))}
          {task.conversation.length === 0 && (
            <p className="text-xs text-muted">No activity logged yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Note & Log</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Outcome</label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as FollowUpOutcome)}>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Notes</label>
            <Textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter notes from call/message..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Next Follow-up Date</label>
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleScheduleNext}
              disabled={!nextDate}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-gold text-sm font-bold text-white shadow-soft transition-all hover:bg-gold-dark hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Schedule Next Follow-up
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onMarkComplete(task)}
                className="flex h-10 items-center justify-center rounded-xl border border-cream-deep bg-white text-xs font-bold text-charcoal shadow-soft transition-colors hover:bg-cream-soft"
              >
                Mark Complete
              </button>
              <button
                onClick={() => canCreateRevision && onCreateRevision(task)}
                disabled={!canCreateRevision}
                title={
                  canCreateRevision
                    ? "Jump into the Quotation Builder"
                    : "Select 'Revision Requested' as the outcome first"
                }
                className="flex h-10 items-center justify-center rounded-xl border border-gold text-xs font-bold text-gold-dark transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
              >
                Create Revision v2
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
