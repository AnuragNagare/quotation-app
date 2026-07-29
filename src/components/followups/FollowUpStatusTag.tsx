import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { FollowUpStatusTag as FollowUpStatusTagValue } from "@/types";

const STATUS_META: Record<
  FollowUpStatusTagValue,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  pending_call: { label: "Pending Call", variant: "default" },
  awaiting_reply: { label: "Awaiting Reply", variant: "info" },
  revision_requested: { label: "Revision Requested", variant: "amber" },
  overdue_no_response: { label: "Overdue", variant: "danger" },
  completed: { label: "Completed", variant: "success" },
};

export function FollowUpStatusTag({ status }: { status: FollowUpStatusTagValue }) {
  const meta = STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export { STATUS_META as FOLLOW_UP_STATUS_META };
