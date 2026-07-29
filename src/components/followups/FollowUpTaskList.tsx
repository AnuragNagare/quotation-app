import { Card } from "@/components/ui/card";
import { FollowUpTaskCard } from "@/components/followups/FollowUpTaskCard";
import type { FollowUpTask, FollowUpTimeSlot } from "@/types";

export type RescheduleHandler = (
  id: string,
  dateLabel: string,
  time: string,
  timeSlot: FollowUpTimeSlot
) => void;

export type GroupMode = "timeSlot" | "date" | "none";

const TIME_SLOT_LABEL: Record<FollowUpTimeSlot, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  overdue: "Overdue",
};

function groupTasks(tasks: FollowUpTask[], groupBy: GroupMode) {
  if (groupBy === "none") {
    return tasks.length ? [{ label: null as string | null, items: tasks }] : [];
  }

  const order: string[] = [];
  const map = new Map<string, FollowUpTask[]>();

  for (const task of tasks) {
    const key = groupBy === "timeSlot" ? TIME_SLOT_LABEL[task.timeSlot] : task.dateLabel;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(task);
  }

  return order.map((label) => ({ label, items: map.get(label)! }));
}

interface FollowUpTaskListProps {
  tasks: FollowUpTask[];
  groupBy: GroupMode;
  selectedTaskId: string | null;
  onSelectTask: (task: FollowUpTask) => void;
  onReschedule: RescheduleHandler;
}

export function FollowUpTaskList({
  tasks,
  groupBy,
  selectedTaskId,
  onSelectTask,
  onReschedule,
}: FollowUpTaskListProps) {
  const groups = groupTasks(tasks, groupBy);

  if (groups.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-sm font-bold text-charcoal">No follow-ups found</p>
        <p className="text-xs text-muted">Try adjusting your search, channel filter, or view.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.label ?? "all"}>
          {group.label && (
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-muted">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {group.items.map((task) => (
              <FollowUpTaskCard
                key={task.id}
                task={task}
                isSelected={task.id === selectedTaskId}
                onSelect={onSelectTask}
                onReschedule={onReschedule}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
