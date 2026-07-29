import { Mail, MessageCircle, Building2, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { EnquirySource } from "@/types";

const SOURCE_META: Record<
  EnquirySource,
  { label: string; icon: LucideIcon; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  email: { label: "Email", icon: Mail, variant: "info" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, variant: "success" },
  hotel_staff: { label: "Hotel Staff", icon: Building2, variant: "amber" },
  website: { label: "Website", icon: Globe, variant: "purple" },
};

export function SourceBadge({ source }: { source: EnquirySource }) {
  const meta = SOURCE_META[source];
  return (
    <Badge variant={meta.variant}>
      <meta.icon className="size-3" />
      {meta.label}
    </Badge>
  );
}

export { SOURCE_META };
