import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Search, Truck, UserCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientTypeBadge } from "@/components/customers/ClientTypeBadge";
import type { EventOperation, EventOperationStatus } from "@/types";

interface EventsListTableProps {
  events: EventOperation[];
  onSelectEvent: (event: EventOperation) => void;
  onMarkDispatched: (eventId: string) => void;
}

function EventStatusBadge({ status }: { status: EventOperationStatus }) {
  switch (status) {
    case "dispatched":
      return <Badge variant="info">Dispatched</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    default:
      return <Badge variant="warning">Confirmed / Pending Dispatch</Badge>;
  }
}

export function EventsListTable({ events, onSelectEvent, onMarkDispatched }: EventsListTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch =
        q.length === 0 ||
        event.id.toLowerCase().includes(q) ||
        event.eventName.toLowerCase().includes(q) ||
        event.venue.toLowerCase().includes(q) ||
        (event.leadEngineer?.name.toLowerCase().includes(q) ?? false);

      const matchesStatus = statusFilter === "all" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">Event Operations</h1>
          <p className="mt-1 text-sm text-muted">
            Track material packing checklists, field crew assignments, and venue dispatch runsheets.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event name, venue, engineer, or event ID..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Dispatch Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Directory Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-soft text-left text-xs font-semibold text-muted">
                <th className="px-5 py-3 font-semibold">Event / Runsheet</th>
                <th className="px-5 py-3 font-semibold">Date &amp; Venue</th>
                <th className="px-5 py-3 font-semibold">Client Type</th>
                <th className="px-5 py-3 font-semibold">Lead Engineer</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className="cursor-pointer border-b border-cream-soft transition-colors last:border-0 hover:bg-cream-soft/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-charcoal">{event.eventName}</p>
                    <p className="font-mono text-xs text-muted">
                      {event.id} · Quote {event.linkedQuoteId}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 font-semibold text-charcoal-soft">
                      <CalendarDays className="size-3.5 text-gold-dark" />
                      {event.eventDate} ({event.setupTime})
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <MapPin className="size-3.5" />
                      {event.venue}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <ClientTypeBadge clientType={event.clientType} />
                  </td>
                  <td className="px-5 py-4">
                    {event.leadEngineer ? (
                      <div className="flex items-center gap-1.5 font-semibold text-charcoal-soft">
                        <UserCheck className="size-3.5 text-success" />
                        {event.leadEngineer.name}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <EventStatusBadge status={event.status} />
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {event.status !== "dispatched" && event.status !== "completed" && (
                        <button
                          onClick={() => onMarkDispatched(event.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                        >
                          <Truck className="size-3.5" />
                          Dispatch
                        </button>
                      )}
                      <button
                        onClick={() => onSelectEvent(event)}
                        className="text-xs font-bold text-gold-dark hover:underline"
                      >
                        Open Runsheet
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-sm text-muted">
                    No event operations found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
