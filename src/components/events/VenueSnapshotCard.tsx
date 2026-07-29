import { MapPin, Calendar, Clock, AlertTriangle } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VenueSnapshotCardProps {
  venue: string;
  venueAddress: string;
  eventDate: string;
  setupTime: string;
  specialInstructions: string;
}

function DetailRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted">{label}</p>
        <p className="text-sm font-bold text-charcoal">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-charcoal-soft">{sub}</p>}
      </div>
    </div>
  );
}

export function VenueSnapshotCard({
  venue,
  venueAddress,
  eventDate,
  setupTime,
  specialInstructions,
}: VenueSnapshotCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event & Venue Snapshot</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <DetailRow
            icon={MapPin}
            label="Venue"
            value={venue}
            sub={venueAddress}
          />
          <DetailRow
            icon={Calendar}
            label="Event Date"
            value={eventDate}
          />
          <DetailRow
            icon={Clock}
            label="Setup By"
            value={setupTime}
          />
        </div>

        {/* Special Instructions Banner */}
        <div className="flex gap-3 rounded-2xl border border-warning/20 bg-warning-light/50 px-4 py-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-charcoal">
              Special Logistics Instructions
            </p>
            <p className="text-sm leading-relaxed text-charcoal-soft">
              {specialInstructions}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
