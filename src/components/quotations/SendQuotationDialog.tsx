import { FileSpreadsheet, FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ClientType } from "@/types";

interface SendQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  clientType: ClientType;
  recipientContact: string;
  onConfirm: () => void;
}

export function SendQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  clientType,
  recipientContact,
  onConfirm,
}: SendQuotationDialogProps) {
  const isDirect = clientType === "direct";
  const fileName = isDirect ? `${quotationId}.pdf` : `${quotationId}.xlsx`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Quotation</DialogTitle>
          <DialogDescription>
            Confirm the recipient before this quotation goes out.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-cream-soft/60 px-4 py-3">
            <span className="text-xs font-semibold text-muted">Recipient</span>
            <span className="text-sm font-bold text-charcoal">{recipientContact}</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-cream-deep px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              {isDirect ? <FileText className="size-4" /> : <FileSpreadsheet className="size-4" />}
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal">{fileName}</p>
              <p className="text-xs text-muted">
                {isDirect ? "Roxy Branded PDF" : "Editable Excel Sheet"} attached
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm & Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
