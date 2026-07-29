import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { revenueByMonth, revenueByQuarter, revenueByYear } from "@/data/mockData";
import { formatINR } from "@/lib/format";
import type { RevenueGranularity, RevenuePeriodPoint } from "@/types";

const GRANULARITY_OPTIONS: { value: RevenueGranularity; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const DATA_BY_GRANULARITY: Record<RevenueGranularity, RevenuePeriodPoint[]> = {
  monthly: revenueByMonth,
  quarterly: revenueByQuarter,
  yearly: revenueByYear,
};

function RevenueTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as RevenuePeriodPoint;
  const total = point.direct + point.hotel;

  return (
    <div className="rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-xs shadow-soft-lg">
      <p className="mb-1 font-bold text-charcoal">{point.period}</p>
      <p className="text-charcoal-soft">
        Direct Clients: <span className="font-semibold">{formatINR(point.direct)}</span>
      </p>
      <p className="text-gold-dark">
        Hotel Partners: <span className="font-semibold">{formatINR(point.hotel)}</span>
      </p>
      <p className="mt-1 border-t border-cream-soft pt-1 font-bold text-charcoal">
        Total: {formatINR(total)}
      </p>
    </div>
  );
}

export function RevenueBreakdownChart() {
  const [granularity, setGranularity] = useState<RevenueGranularity>("monthly");
  const data = DATA_BY_GRANULARITY[granularity];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Direct Client Revenue vs Hotel Partner Revenue</CardTitle>
        <Select value={granularity} onValueChange={(v) => setGranularity(v as RevenueGranularity)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRANULARITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="directFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-charcoal)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--color-charcoal)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="hotelFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-cream-soft)" />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`}
                width={48}
              />
              <Tooltip content={RevenueTooltip} />
              <Area
                type="monotone"
                dataKey="direct"
                stackId="revenue"
                stroke="var(--color-charcoal)"
                strokeWidth={2}
                fill="url(#directFill)"
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="hotel"
                stackId="revenue"
                stroke="var(--color-gold)"
                strokeWidth={2}
                fill="url(#hotelFill)"
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-charcoal-soft">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-charcoal" />
            Direct Clients · Same-Day Billing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gold" />
            Hotel Partners · End-of-Month Batch Billing
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
