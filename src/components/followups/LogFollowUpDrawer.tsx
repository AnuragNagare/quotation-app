import { useState } from "react";
import type { ReactNode } from "react";
import { Mail, MessageCircle, Phone, PhoneCall } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatINR, formatDisplayDate, formatDisplayTime } from "@/lib/format";
import { deriveFollowUpTimeSlot } from "@/lib/followups";
import { recentQuotations, customerAccounts, staffMembers } from "@/data/mockData";
import type { FollowUpChannel, FollowUpPriority, FollowUpTask } from "@/types";

const CHANNELS: { value: FollowUpChannel; label: string; icon: typeof Phone }[] = [
  { value: "call", label: "Call", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "email", label: "Email", icon: Mail },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-charcoal-soft">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

interface LogFollowUpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (task: FollowUpTask) => void;
}

export function LogFollowUpDrawer({ open, onOpenChange, onCreate }: LogFollowUpDrawerProps) {
  const [quoteId, setQuoteId] = useState("");
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [channel, setChannel] = useState<FollowUpChannel>("call");
  const [priority, setPriority] = useState<FollowUpPriority>("normal");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [staffId, setStaffId] = useState("");
  const [note, setNote] = useState("");

  const selectedQuote = recentQuotations.find((q) => q.id === quoteId);
  const canSave = Boolean(selectedQuote && eventName.trim() && date && time);

  function reset() {
    setQuoteId("");
    setEventName("");
    setVenue("");
    setChannel("call");
    setPriority("normal");
    setDate("");
    setTime("");
    setStaffId("");
    setNote("");
  }

  function handleSave() {
    if (!selectedQuote || !date || !time || !eventName.trim()) return;

    const matchedCustomer = customerAccounts.find((c) => c.name === selectedQuote.customer);
    const staff = staffMembers.find((s) => s.id === staffId) ?? null;

    const task: FollowUpTask = {
      id: `fu-${Date.now()}`,
      quoteNumber: selectedQuote.number,
      eventName: eventName.trim(),
      venue: venue.trim() || "—",
      amount: selectedQuote.amount,
      customerName: selectedQuote.customer,
      clientType: selectedQuote.clientType,
      contactPhone: matchedCustomer?.contactPerson.phone ?? "",
      dateLabel: formatDisplayDate(date),
      scheduledTime: formatDisplayTime(time),
      timeSlot: deriveFollowUpTimeSlot(time),
      channel,
      statusTag: "pending_call",
      priority,
      assignedStaff: staff,
      completed: false,
      conversation: note.trim()
        ? [{ id: `fuc-${Date.now()}`, date: "Today", label: "Follow-up Logged", detail: note.trim() }]
        : [],
    };

    onCreate(task);
    reset();
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) reset(); }}>
      <SheetContent>
        <SheetHeader>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <PhoneCall className="size-5" />
          </div>
          <div>
            <SheetTitle>Log New Follow-up</SheetTitle>
            <SheetDescription>Schedule a check-in against an existing quotation</SheetDescription>
          </div>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-5">
          <Field label="Quotation" required>
            <Select value={quoteId} onValueChange={setQuoteId}>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="Select a quotation" />
              </SelectTrigger>
              <SelectContent>
                {recentQuotations.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.number} — {q.customer} ({formatINR(q.amount)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Event / Reference" required>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Wedding - John & Sara"
            />
          </Field>

          <Field label="Venue / Location">
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Enter venue" />
          </Field>

          <Field label="Channel" required>
            <div className="grid grid-cols-3 gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-semibold transition-colors",
                    channel === c.value
                      ? "border-gold bg-gold-light text-gold-dark"
                      : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                  )}
                >
                  <c.icon className="size-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Priority">
            <div className="flex rounded-xl border border-cream-deep bg-white p-1">
              {(["normal", "high"] as FollowUpPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                    priority === p
                      ? "bg-gold text-white shadow-soft"
                      : "text-charcoal-soft hover:text-charcoal"
                  )}
                >
                  {p === "normal" ? "Normal" : "High Priority"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Time" required>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>

          <Field label="Assign To">
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="h-10 w-full text-sm">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Notes">
            <Textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any context for the next staff member handling this..."
            />
          </Field>
        </SheetBody>

        <SheetFooter>
          <Button size="lg" onClick={handleSave} disabled={!canSave}>
            Save Follow-up
          </Button>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
