import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { UserRole } from "@/types";

const ROLE_META: Record<
  UserRole,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  admin: { label: "Admin", variant: "charcoal" },
  sales: { label: "Sales Representative", variant: "gold" },
  operations: { label: "Operations Lead", variant: "info" },
  finance: { label: "Finance Manager", variant: "success" },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export { ROLE_META };
