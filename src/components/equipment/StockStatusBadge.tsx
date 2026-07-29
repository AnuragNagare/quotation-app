import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { StockStatus } from "@/types";

const STOCK_STATUS_META: Record<
  StockStatus,
  { label: string; variant: NonNullable<VariantProps<typeof badgeVariants>["variant"]> }
> = {
  available: { label: "Available", variant: "success" },
  low_stock: { label: "Low Stock", variant: "warning" },
  in_maintenance: { label: "In Maintenance", variant: "danger" },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const meta = STOCK_STATUS_META[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export { STOCK_STATUS_META };
