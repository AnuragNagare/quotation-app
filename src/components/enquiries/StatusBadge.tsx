import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { EnquiryStatus } from "@/types";

const STATUS_META: Record<
  EnquiryStatus,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  new: { label: "New Request", variant: "gold" },
  quoted: { label: "Quotation Created", variant: "info" },
  followup: { label: "Follow-up Scheduled", variant: "orange" },
  converted: { label: "Converted to Event", variant: "success" },
  closed: { label: "Closed / Lost", variant: "default" },
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export { STATUS_META };
