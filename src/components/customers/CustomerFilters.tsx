import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type QuickFilter = "active_enquiries" | "outstanding_balance" | "top_tier";

const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: "active_enquiries", label: "Active Enquiries" },
  { value: "outstanding_balance", label: "Outstanding Balance" },
  { value: "top_tier", label: "Top Tier" },
];

interface CustomerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeQuickFilters: QuickFilter[];
  onToggleQuickFilter: (filter: QuickFilter) => void;
}

export function CustomerFilters({
  search,
  onSearchChange,
  activeQuickFilters,
  onToggleQuickFilter,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer name, hotel, email, phone, or location..."
          className="rounded-2xl bg-white pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {QUICK_FILTERS.map((f) => {
          const active = activeQuickFilters.includes(f.value);
          return (
            <button
              key={f.value}
              onClick={() => onToggleQuickFilter(f.value)}
              className={cn(
                "shrink-0 rounded-pill px-3.5 py-2 text-xs font-semibold transition-colors",
                active
                  ? "bg-gold text-white shadow-soft"
                  : "bg-cream-soft text-charcoal-soft hover:bg-cream-deep/60"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
