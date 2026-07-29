import { ChevronRight, Eye, Save, Send } from "lucide-react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { QuotationStatus } from "@/types";
import type { VariantProps } from "class-variance-authority";

const STATUS_VARIANT: Record<
  QuotationStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  draft: "default",
  sent: "info",
  pending: "warning",
  approved: "success",
  cancelled: "danger",
  revision: "orange",
};

const STATUS_LABEL: Record<QuotationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  pending: "Pending",
  approved: "Approved",
  cancelled: "Cancelled",
  revision: "Revision Requested",
};

interface QuotationHeaderProps {
  quotationId: string;
  enquiryId: string;
  status: QuotationStatus;
  revisionLabel: string;
  onSaveDraft: () => void;
  onPreview: () => void;
  onSend: () => void;
}

export function QuotationHeader({
  quotationId,
  enquiryId,
  status,
  revisionLabel,
  onSaveDraft,
  onPreview,
  onSend,
}: QuotationHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <span>Enquiries</span>
        <ChevronRight className="size-3" />
        <span>{enquiryId}</span>
        <ChevronRight className="size-3" />
        <span className="text-charcoal">Create Quotation</span>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
            Quotation {quotationId}
          </h1>
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          <Badge variant="outline">{revisionLabel}</Badge>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={onSaveDraft}>
            <Save className="size-4" />
            Save Draft
          </Button>
          <Button variant="secondary" onClick={onPreview}>
            <Eye className="size-4" />
            Preview
          </Button>
          <Button size="lg" onClick={onSend}>
            <Send className="size-4" />
            Send Quotation
          </Button>
        </div>
      </div>
    </div>
  );
}
