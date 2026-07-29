import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-cream-soft text-charcoal-soft",
        charcoal: "bg-charcoal text-white",
        gold: "bg-gold-light text-gold-dark",
        success: "bg-success-light text-success",
        danger: "bg-danger-light text-danger",
        info: "bg-info-light text-info",
        warning: "bg-warning-light text-warning",
        purple: "bg-purple-light text-purple",
        orange: "bg-orange-light text-orange",
        amber: "bg-amber-light text-amber",
        outline: "border border-cream-deep text-charcoal-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
