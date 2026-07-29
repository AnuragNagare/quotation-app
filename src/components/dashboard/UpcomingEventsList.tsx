import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { upcomingEvents } from "@/data/mockData";
import type { EventStatus } from "@/types";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  EventStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  confirmed: "success",
  tentative: "warning",
  cancelled: "danger",
};

const STATUS_LABEL: Record<EventStatus, string> = {
  confirmed: "Confirmed",
  tentative: "Tentative",
  cancelled: "Cancelled",
};

export function UpcomingEventsList() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <Button variant="ghost" size="sm">
          View Calendar
        </Button>
      </CardHeader>
      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-4 rounded-2xl border border-cream-soft p-3.5 transition-colors hover:bg-cream-soft/60"
          >
            <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              <span className="text-base font-extrabold leading-none">{event.day}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {event.month}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-charcoal">{event.name}</p>
              <p className="truncate text-xs text-muted">{event.venue}</p>
            </div>

            <Badge variant={STATUS_VARIANT[event.status]}>
              {STATUS_LABEL[event.status]}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
