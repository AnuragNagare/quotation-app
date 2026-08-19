import { Calendar, MapPin } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/format";
import type { ClientType } from "@/types";

interface ClientEventCardProps {
  clientName: string;
  clientType: ClientType;
  eventName: string;
  eventDate: string;
  venue: string;
}

export function ClientEventCard({
  clientName,
  clientType,
  eventName,
  eventDate,
  venue,
}: ClientEventCardProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback>{getInitials(clientName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-bold text-charcoal">{clientName}</p>
            <span className="mt-0.5 inline-block rounded-md bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-charcoal-soft">
              {clientType === "direct" ? "Direct Client" : "Hotel Partner"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:border-l sm:border-cream-soft sm:pl-6">
          <p className="text-base font-bold text-charcoal">{eventName}</p>
          <div className="flex items-center gap-1.5 text-sm text-charcoal-soft">
            <Calendar className="size-3.5 text-muted" />
            {eventDate}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-charcoal-soft">
            <MapPin className="size-3.5 text-muted" />
            {venue}
          </div>
        </div>
      </div>
    </Card>
  );
}
