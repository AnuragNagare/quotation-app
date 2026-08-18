import { Calendar, Layers, MapPin, Percent, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/format";
import { staffMembers } from "@/data/mockData";
import type { ClientType, EventDivision, StaffMember } from "@/types";

interface ClientEventCardProps {
  clientName: string;
  clientType: ClientType;
  eventName: string;
  eventDate: string;
  venue: string;
  division?: EventDivision;
  salesRep?: StaffMember | null;
  commissionPercent?: number;
  onDivisionChange?: (division: EventDivision) => void;
  onSalesRepChange?: (staff: StaffMember | null) => void;
  onCommissionChange?: (percent: number) => void;
}

const DIVISIONS: EventDivision[] = [
  "Full Production",
  "Audio",
  "Visual",
  "Lighting",
  "Stage",
];

export function ClientEventCard({
  clientName,
  clientType,
  eventName,
  eventDate,
  venue,
  division = "Full Production",
  salesRep = null,
  commissionPercent = 5,
  onDivisionChange,
  onSalesRepChange,
  onCommissionChange,
}: ClientEventCardProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Client details */}
        <div className="flex items-start gap-3">
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

        {/* Event details */}
        <div className="flex flex-col gap-2 md:border-l md:border-cream-soft md:pl-6">
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

        {/* Division & Sales Commission */}
        <div className="flex flex-col gap-3 rounded-xl bg-cream-soft/50 p-3 md:border-l md:border-cream-soft md:bg-transparent md:p-0 md:pl-6">
          <div>
            <label className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase text-muted">
              <Layers className="size-3" /> Division
            </label>
            <Select
              value={division}
              onValueChange={(val) => onDivisionChange?.(val as EventDivision)}
            >
              <SelectTrigger className="h-8 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIVISIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase text-muted">
                <User className="size-3" /> Sales Rep
              </label>
              <Select
                value={salesRep?.id || "none"}
                onValueChange={(val) => {
                  const found = staffMembers.find((s) => s.id === val) || null;
                  onSalesRepChange?.(found);
                }}
              >
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue placeholder="Assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staffMembers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-extrabold uppercase text-muted">
                <Percent className="size-3" /> Comm. (%)
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                value={commissionPercent}
                onChange={(e) => onCommissionChange?.(Number(e.target.value))}
                className="h-8 text-xs font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
