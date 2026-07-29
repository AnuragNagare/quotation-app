import { cn } from "@/lib/utils";

export type CustomerSegment = "all" | "hotel" | "direct";

const TABS: { id: CustomerSegment; label: string }[] = [
  { id: "all", label: "All Customers" },
  { id: "hotel", label: "Hotel Partners" },
  { id: "direct", label: "Direct Clients" },
];

interface CustomerSegmentTabsProps {
  activeSegment: CustomerSegment;
  onSegmentChange: (segment: CustomerSegment) => void;
}

export function CustomerSegmentTabs({
  activeSegment,
  onSegmentChange,
}: CustomerSegmentTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-black/[0.03] bg-white p-1.5 shadow-soft">
      {TABS.map((tab) => {
        const isActive = activeSegment === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSegmentChange(tab.id)}
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
