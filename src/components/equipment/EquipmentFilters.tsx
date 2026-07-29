import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EquipmentCategory, StockStatus } from "@/types";

export type CategoryFilter = "all" | EquipmentCategory;
export type AvailabilityFilter = "all" | StockStatus;

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "Audio", label: "Audio" },
  { value: "Visual", label: "Visual & LED" },
  { value: "Lighting", label: "Lighting" },
  { value: "Stage", label: "Staging & Rigging" },
  { value: "Cables & Accessories", label: "Cables & Accessories" },
];

const AVAILABILITY_FILTERS: { value: AvailabilityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Available" },
  { value: "low_stock", label: "Low Stock" },
  { value: "in_maintenance", label: "Out for Service" },
];

interface EquipmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  availabilityFilter: AvailabilityFilter;
  onAvailabilityFilterChange: (value: AvailabilityFilter) => void;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-2 text-xs font-semibold transition-colors",
        active
          ? "bg-gold text-white shadow-soft"
          : "bg-cream-soft text-charcoal-soft hover:bg-cream-deep/60"
      )}
    >
      {children}
    </button>
  );
}

export function EquipmentFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  availabilityFilter,
  onAvailabilityFilterChange,
}: EquipmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by item name, SKU, category, or model..."
          className="rounded-2xl bg-white pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {CATEGORY_FILTERS.map((f) => (
          <Pill
            key={f.value}
            active={categoryFilter === f.value}
            onClick={() => onCategoryFilterChange(f.value)}
          >
            {f.label}
          </Pill>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {AVAILABILITY_FILTERS.map((f) => (
          <Pill
            key={f.value}
            active={availabilityFilter === f.value}
            onClick={() => onAvailabilityFilterChange(f.value)}
          >
            {f.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
