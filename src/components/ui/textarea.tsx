import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-sm text-charcoal placeholder:text-muted outline-none transition-colors",
        "focus-visible:border-gold/50 focus-visible:ring-2 focus-visible:ring-gold/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
