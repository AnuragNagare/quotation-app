import { ChevronRight, Printer, Truck, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ClientType, EventOperationStatus } from "@/types";

interface EventHeaderProps {
  eventId: string;
  eventName: string;
  linkedQuoteId: string;
  clientType: ClientType;
  status: EventOperationStatus;
  onPrint: () => void;
  onMarkDispatched: () => void;
  isDispatched: boolean;
}

const STATUS_VARIANT: Record<EventOperationStatus, "success" | "gold" | "info"> = {
  confirmed: "success",
  dispatched: "gold",
  completed: "info",
};

const STATUS_LABEL: Record<EventOperationStatus, string> = {
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  completed: "Completed",
};

export function EventHeader({
  eventId,
  eventName,
  linkedQuoteId,
  clientType,
  status,
  onPrint,
  onMarkDispatched,
  isDispatched,
}: EventHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <span>Events</span>
        <ChevronRight className="size-3" />
        <span>{eventId}</span>
        <ChevronRight className="size-3" />
        <span className="text-charcoal">Operations & Logistics</span>
      </div>

      {/* Title + Badges + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
            Event: {eventName}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANT[status]}>
              Status: {STATUS_LABEL[status]}
            </Badge>
            <Badge variant="info">Linked Quote: {linkedQuoteId}</Badge>
            <Badge variant="default">
              {clientType === "direct" ? "Direct Client" : "Hotel Partner"}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="secondary" onClick={onPrint}>
            <Printer className="size-4" />
            Print Packing Slip
          </Button>

          {isDispatched ? (
            <Button size="lg" disabled className="gap-2 opacity-90">
              <CheckCircle2 className="size-4" />
              Dispatched
            </Button>
          ) : (
            <Button size="lg" onClick={onMarkDispatched}>
              <Truck className="size-4" />
              Mark Ready for Dispatch
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
