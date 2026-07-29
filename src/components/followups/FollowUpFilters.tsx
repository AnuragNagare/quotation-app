import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FOLLOW_UP_CHANNEL_META } from "@/components/followups/FollowUpChannelBadge";
import type { FollowUpChannel } from "@/types";

export type ChannelFilter = "all" | FollowUpChannel;

const CHANNEL_FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "All Channels" },
  { value: "call", label: "Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];

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

interface FollowUpFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  channelFilter: ChannelFilter;
  onChannelFilterChange: (value: ChannelFilter) => void;
}

export function FollowUpFilters({
  search,
  onSearchChange,
  channelFilter,
  onChannelFilterChange,
}: FollowUpFiltersProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer, quotation ID, or assigned staff..."
          className="rounded-2xl bg-white pl-10"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
        {CHANNEL_FILTERS.map((f) => (
          <Pill
            key={f.value}
            active={channelFilter === f.value}
            onClick={() => onChannelFilterChange(f.value)}
          >
            {f.value !== "all" && (
              <span className="[&_svg]:size-3">
                {(() => {
                  const Icon = FOLLOW_UP_CHANNEL_META[f.value].icon;
                  return <Icon className="size-3" />;
                })()}
              </span>
            )}
            {f.label}
          </Pill>
        ))}
      </div>
    </div>
  );
}
