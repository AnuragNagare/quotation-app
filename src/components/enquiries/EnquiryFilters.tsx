import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SOURCE_META } from "@/components/enquiries/SourceBadge";
import { STATUS_META } from "@/components/enquiries/StatusBadge";
import type { EnquirySource, EnquiryStatus } from "@/types";

export type SourceFilter = "all" | EnquirySource | "unassigned";
export type StatusFilter = "all" | EnquiryStatus;

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All Enquiries" },
  { value: "email", label: "From Email" },
  { value: "whatsapp", label: "From WhatsApp" },
  { value: "hotel_staff", label: "From Hotel Staff" },
  { value: "website", label: "From Website" },
  { value: "unassigned", label: "Unassigned" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "quoted", label: "Quoted" },
  { value: "followup", label: "Follow-up Needed" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Dropped" },
];

interface EnquiryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sourceFilter: SourceFilter;
  onSourceFilterChange: (value: SourceFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
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
          : "bg-white text-charcoal-soft shadow-soft hover:text-charcoal"
      )}
    >
      {children}
    </button>
  );
}

export function EnquiryFilters({
  search,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  statusFilter,
  onStatusFilterChange,
}: EnquiryFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer name, hotel, venue, or enquiry ID..."
          className="rounded-2xl bg-white pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {SOURCE_FILTERS.map((f) => (
          <Pill
            key={f.value}
            active={sourceFilter === f.value}
            onClick={() => onSourceFilterChange(f.value)}
          >
            {f.value !== "all" && f.value !== "unassigned" && (
              <span className="[&_svg]:size-3">
                {(() => {
                  const Icon = SOURCE_META[f.value].icon;
                  return <Icon className="size-3" />;
                })()}
              </span>
            )}
            {f.label}
          </Pill>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {STATUS_FILTERS.map((f) => (
          <Pill
            key={f.value}
            active={statusFilter === f.value}
            onClick={() => onStatusFilterChange(f.value)}
          >
            {f.value !== "all" && (
              <span
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor: `var(--color-${STATUS_META[f.value].variant === "default" ? "muted" : STATUS_META[f.value].variant})`,
                }}
              />
            )}
            {f.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
