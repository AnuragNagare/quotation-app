import { useEffect, useRef, useState } from "react";
import { CalendarClock, MessageCircle, PhoneCall } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatINR, formatDisplayDate, formatDisplayTime } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { deriveFollowUpTimeSlot } from "@/lib/followups";
import { cn } from "@/lib/utils";
import { FollowUpStatusTag } from "@/components/followups/FollowUpStatusTag";
import type { FollowUpTask, FollowUpTimeSlot } from "@/types";

function ClientFormatBadge({ clientType }: { clientType: FollowUpTask["clientType"] }) {
  return clientType === "hotel" ? (
    <Badge variant="purple">Hotel Partner · Excel</Badge>
  ) : (
    <Badge variant="info">Direct Client · PDF</Badge>
  );
}

function ReschedulePopover({
  onReschedule,
}: {
  onReschedule: (dateLabel: string, time: string, timeSlot: FollowUpTimeSlot) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSave() {
    if (!date || !time) return;
    onReschedule(formatDisplayDate(date), formatDisplayTime(time), deriveFollowUpTimeSlot(time));
    setOpen(false);
    setDate("");
    setTime("");
  }

  return (
    <div ref={containerRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        aria-label="Reschedule"
        title="Reschedule"
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-lg border border-cream-deep bg-white text-charcoal-soft shadow-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
      >
        <CalendarClock className="size-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-cream-deep bg-white p-3 shadow-soft-lg">
          <p className="mb-2 text-xs font-bold text-charcoal">Reschedule Follow-up</p>
          <div className="flex flex-col gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-xs" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 text-xs" />
            <button
              onClick={handleSave}
              disabled={!date || !time}
              className="mt-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save New Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FollowUpTaskCardProps {
  task: FollowUpTask;
  isSelected: boolean;
  onSelect: (task: FollowUpTask) => void;
  onReschedule: (id: string, dateLabel: string, time: string, timeSlot: FollowUpTimeSlot) => void;
}

export function FollowUpTaskCard({ task, isSelected, onSelect, onReschedule }: FollowUpTaskCardProps) {
  const whatsappLink = buildWhatsAppLink(task.contactPhone, task.quoteNumber, task.eventName, task.amount);

  return (
    <div
      onClick={() => onSelect(task)}
      className={cn(
        "cursor-pointer rounded-2xl border bg-white p-4 shadow-soft transition-all",
        task.priority === "high" && "border-l-4 border-l-danger",
        isSelected
          ? "border-gold bg-gold-light/30 ring-1 ring-gold"
          : "border-cream-deep hover:-translate-y-0.5 hover:shadow-soft-lg"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-charcoal">{task.quoteNumber}</p>
          <p className="truncate text-xs text-muted">
            {task.eventName} · {formatINR(task.amount)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-xs font-bold text-charcoal-soft">{task.scheduledTime}</span>
          <FollowUpStatusTag status={task.statusTag} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-charcoal">{task.customerName}</p>
        <ClientFormatBadge clientType={task.clientType} />
      </div>

      <div className="mt-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
          className="flex size-8 items-center justify-center rounded-lg bg-gold text-white shadow-soft transition-colors hover:bg-gold-dark"
        >
          <MessageCircle className="size-3.5" />
        </a>
        <button
          aria-label="Log Call Result"
          title="Log Call Result"
          onClick={() => onSelect(task)}
          className="flex size-8 items-center justify-center rounded-lg border border-cream-deep bg-white text-charcoal-soft shadow-soft transition-colors hover:bg-cream-soft hover:text-charcoal"
        >
          <PhoneCall className="size-3.5" />
        </button>
        <ReschedulePopover
          onReschedule={(dateLabel, time, timeSlot) =>
            onReschedule(task.id, dateLabel, time, timeSlot)
          }
        />
      </div>
    </div>
  );
}
