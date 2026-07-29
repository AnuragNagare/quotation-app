import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { PaymentStatus } from "@/types";

const PAYMENT_META: Record<
  PaymentStatus,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  paid: { label: "Paid", variant: "success" },
  unbilled: { label: "Unbilled", variant: "gold" },
  issued: { label: "Issued / Sent", variant: "info" },
  overdue: { label: "Overdue", variant: "danger" },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const meta = PAYMENT_META[status] || { label: status, variant: "default" };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export { PAYMENT_META };
