import { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuotationStatus } from "@/types";

const STATUS_OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
  { value: "revision", label: "Revision Requested" },
];

interface StatusTrackerCardProps {
  status: QuotationStatus;
  onStatusChange: (status: QuotationStatus) => void;
}

interface LoggedNote {
  id: string;
  note: string;
  time: string;
}

export function StatusTrackerCard({ status, onStatusChange }: StatusTrackerCardProps) {
  const [note, setNote] = useState("");
  const [log, setLog] = useState<LoggedNote[]>([]);

  function handleLog() {
    if (!note.trim()) return;
    setLog((prev) => [
      { id: `note-${Date.now()}`, note: note.trim(), time: "Just now" },
      ...prev,
    ]);
    setNote("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-Up & Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-charcoal-soft">Current Status</label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as QuotationStatus)}>
            <SelectTrigger className="h-10 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-charcoal-soft">Log Follow-Up</label>
          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Called manager, waiting for final approval"
          />
          <Button variant="secondary" size="sm" className="self-end" onClick={handleLog}>
            Log Note
          </Button>
        </div>

        {log.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-cream-soft pt-3">
            {log.map((entry) => (
              <div key={entry.id} className="rounded-xl bg-cream-soft/60 px-3 py-2">
                <p className="text-sm text-charcoal-soft">{entry.note}</p>
                <p className="text-xs text-muted">{entry.time}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
