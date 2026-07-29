import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quotationStatusBreakdown } from "@/data/mockData";
import { formatINR } from "@/lib/format";

const RANGES = ["Today", "This Week", "This Month", "This Year"] as const;

function StatusTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const slice = payload[0]?.payload as (typeof quotationStatusBreakdown)[number];

  return (
    <div className="rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-xs shadow-soft-lg">
      <p className="font-bold text-charcoal">{slice.label}</p>
      <p className="text-muted">
        {slice.value} quotations · {slice.percentage}%
      </p>
      <p className="font-semibold text-gold-dark">{formatINR(slice.revenue)}</p>
    </div>
  );
}

export function QuotationStatusChart() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("This Month");

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Quotation Status</CardTitle>
        <Select value={range} onValueChange={(v) => setRange(v as typeof range)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="h-[170px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={quotationStatusBreakdown}
                dataKey="value"
                nameKey="label"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
                animationDuration={800}
              >
                {quotationStatusBreakdown.map((slice) => (
                  <Cell key={slice.label} fill={slice.colorVar} />
                ))}
              </Pie>
              <Tooltip content={StatusTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5">
          {quotationStatusBreakdown.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: slice.colorVar }}
                />
                <span className="font-medium text-charcoal-soft">{slice.label}</span>
              </div>
              <span className="font-bold text-charcoal">
                {slice.value} ({slice.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
