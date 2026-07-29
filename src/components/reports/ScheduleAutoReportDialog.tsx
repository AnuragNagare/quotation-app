import { useState } from "react";
import { CalendarClock, FileSpreadsheet, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ReportFrequency = "weekly" | "monthly";
export type ReportFormat = "pdf" | "excel";

interface ScheduleAutoReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmSchedule: (frequency: ReportFrequency, format: ReportFormat, recipientEmail: string) => void;
}

export function ScheduleAutoReportDialog({
  open,
  onOpenChange,
  onConfirmSchedule,
}: ScheduleAutoReportDialogProps) {
  const [frequency, setFrequency] = useState<ReportFrequency>("weekly");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [email, setEmail] = useState("");

  const canSchedule = email.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Auto-Report</DialogTitle>
          <DialogDescription>
            Automatically deliver this analytics dashboard to management on a recurring basis.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Frequency</label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as ReportFrequency)}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly — every Monday</SelectItem>
                <SelectItem value="monthly">Monthly — 1st of the month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Recipient Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="management@roxy.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Report Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all",
                  format === "pdf"
                    ? "border-gold bg-gold-light text-gold-dark"
                    : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                )}
              >
                <FileText className="size-5 text-danger" />
                PDF Document
              </button>
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all",
                  format === "excel"
                    ? "border-gold bg-gold-light text-gold-dark"
                    : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                )}
              >
                <FileSpreadsheet className="size-5 text-success" />
                Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirmSchedule(frequency, format, email.trim())}
            disabled={!canSchedule}
            className="gap-2"
          >
            <CalendarClock className="size-4" /> Schedule Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
