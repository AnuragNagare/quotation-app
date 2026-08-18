import { useState } from "react";
import { Check, Copy, ExternalLink, FileSpreadsheet, FileText, Link } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { saveQuotation } from "@/data/quotationStore";
import type { ClientType, QuotationDetail } from "@/types";

interface SendQuotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotationId: string;
  clientType: ClientType;
  recipientContact: string;
  quotationDetail: QuotationDetail;
  onConfirm: () => void;
}

export function SendQuotationDialog({
  open,
  onOpenChange,
  quotationId,
  clientType,
  recipientContact,
  quotationDetail,
  onConfirm,
}: SendQuotationDialogProps) {
  const isDirect = clientType === "direct";
  const fileName = isDirect ? `${quotationId}.pdf` : `${quotationId}.xlsx`;

  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleConfirm() {
    // Save quote to store and generate shareable link
    const id = saveQuotation(quotationDetail);
    setShareId(id);
    onConfirm();
  }

  const shareUrl = shareId
    ? `${window.location.origin}/q/${shareId}`
    : null;

  function handleCopy() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClose() {
    onOpenChange(false);
    // Reset state after close animation
    setTimeout(() => {
      setShareId(null);
      setCopied(false);
    }, 300);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{shareId ? "Quotation Sent!" : "Send Quotation"}</DialogTitle>
          <DialogDescription>
            {shareId
              ? "Your quotation is live. Share the link below with your client."
              : "Confirm the recipient before this quotation goes out."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          {/* Recipient row */}
          <div className="flex items-center justify-between rounded-xl bg-cream-soft/60 px-4 py-3">
            <span className="text-xs font-semibold text-muted">Recipient</span>
            <span className="text-sm font-bold text-charcoal">{recipientContact}</span>
          </div>

          {/* File format row */}
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

          {/* Shareable link — shown after confirm */}
          {shareUrl && (
            <div className="rounded-xl border border-gold/30 bg-gold-soft px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                <Link className="size-3.5 text-gold-dark" />
                <p className="text-xs font-extrabold text-gold-dark">Shareable Client Link</p>
              </div>
              <p className="mb-2.5 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-charcoal-soft">
                {shareUrl}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-gold/30 bg-white px-3 py-2 text-xs font-semibold text-gold-dark transition-colors hover:bg-gold-light"
                >
                  <ExternalLink className="size-3.5" />
                  Preview
                </a>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {shareId ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm &amp; Send</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
