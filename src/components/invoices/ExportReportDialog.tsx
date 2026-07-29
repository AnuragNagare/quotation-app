import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmExport: (format: "pdf" | "excel" | "csv", range: string) => void;
}

export function ExportReportDialog({
  open,
  onOpenChange,
  onConfirmExport,
}: ExportReportDialogProps) {
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("excel");
  const [range, setRange] = useState("may_2026");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Financial & Billing Report</DialogTitle>
          <DialogDescription>
            Download consolidated billing statements, tax breakdowns, and revenue summaries.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Select Date Range</label>
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="h-10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="may_2026">May 2026 (Current Month)</SelectItem>
                <SelectItem value="apr_2026">April 2026</SelectItem>
                <SelectItem value="q1_2026">Q1 2026 (Jan - Mar)</SelectItem>
                <SelectItem value="ytd">Year-to-Date (2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                  format === "excel"
                    ? "border-gold bg-gold-light text-gold-dark"
                    : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                }`}
              >
                <FileSpreadsheet className="size-5 text-success" />
                Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                  format === "pdf"
                    ? "border-gold bg-gold-light text-gold-dark"
                    : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                }`}
              >
                <FileText className="size-5 text-danger" />
                PDF Document
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition-all ${
                  format === "csv"
                    ? "border-gold bg-gold-light text-gold-dark"
                    : "border-cream-deep bg-white text-charcoal-soft hover:bg-cream-soft"
                }`}
              >
                <Download className="size-5 text-info" />
                CSV Data
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirmExport(format, range)} className="gap-2">
            <Download className="size-4" /> Export Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
