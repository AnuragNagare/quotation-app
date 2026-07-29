import { Mail, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { FollowUpChannel } from "@/types";

const CHANNEL_META: Record<
  FollowUpChannel,
  { label: string; icon: LucideIcon; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  call: { label: "Call", icon: Phone, variant: "info" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, variant: "success" },
  email: { label: "Email", icon: Mail, variant: "purple" },
};

export function FollowUpChannelBadge({ channel }: { channel: FollowUpChannel }) {
  const meta = CHANNEL_META[channel];
  return (
    <Badge variant={meta.variant}>
      <meta.icon className="size-3" />
      {meta.label}
    </Badge>
  );
}

export { CHANNEL_META as FOLLOW_UP_CHANNEL_META };
