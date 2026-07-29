import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatSignedPercent } from "@/lib/format";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: number;
  sublabel: string;
}

export function KpiCard({ icon: Icon, label, value, delta, sublabel }: KpiCardProps) {
  const isPositive = delta >= 0;

  return (
    <Card className="p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal">
            {value}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5",
            isPositive ? "bg-success-light text-success" : "bg-danger-light text-danger"
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="size-3" />
          ) : (
            <ArrowDownRight className="size-3" />
          )}
          {formatSignedPercent(delta)}
        </span>
        <span className="text-muted">{sublabel}</span>
      </div>
    </Card>
  );
}
