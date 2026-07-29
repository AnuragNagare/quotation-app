import { cn } from "@/lib/utils";

export type FollowUpView = "today" | "upcoming" | "overdue" | "all";

const TABS: { id: FollowUpView; label: string }[] = [
  { id: "today", label: "Today's Schedule" },
  { id: "upcoming", label: "Upcoming (This Week)" },
  { id: "overdue", label: "Overdue" },
  { id: "all", label: "All Logs" },
];

interface FollowUpViewTabsProps {
  activeView: FollowUpView;
  onViewChange: (view: FollowUpView) => void;
}

export function FollowUpViewTabs({ activeView, onViewChange }: FollowUpViewTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-black/[0.03] bg-white p-1.5 shadow-soft">
      {TABS.map((tab) => {
        const isActive = activeView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm",
              isActive
                ? "bg-gold text-white shadow-soft"
                : "text-charcoal-soft hover:bg-cream-soft hover:text-charcoal"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
