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

interface ExportContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmExport: (format: "csv" | "excel") => void;
}

export function ExportContactsDialog({
  open,
  onOpenChange,
  onConfirmExport,
}: ExportContactsDialogProps) {
  const [format, setFormat] = useState<"csv" | "excel">("csv");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
          <DialogDescription>
            Download the full customer & hotel partner directory.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirmExport(format)}>
            <FileText className="size-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
