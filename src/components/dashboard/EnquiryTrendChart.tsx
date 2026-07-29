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
import { enquiryTrend } from "@/data/mockData";

const FILTERS = ["Daily", "Weekly", "Monthly", "Yearly"] as const;

function TrendTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as (typeof enquiryTrend)[number];

  return (
    <div className="rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-xs shadow-soft-lg">
      <p className="mb-1 font-bold text-charcoal">{point.date}</p>
      <p className="text-charcoal-soft">Enquiries: <span className="font-semibold">{point.enquiries}</span></p>
      <p className="text-success">Approved: <span className="font-semibold">{point.approved}</span></p>
      <p className="text-danger">Cancelled: <span className="font-semibold">{point.cancelled}</span></p>
    </div>
  );
}

export function EnquiryTrendChart() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Weekly");

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Enquiry Trend</CardTitle>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[260px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={enquiryTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="enquiryFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-cream-soft)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            />
            <Tooltip content={TrendTooltip} />
            <Area
              type="monotone"
              dataKey="enquiries"
              stroke="var(--color-gold)"
              strokeWidth={3}
              fill="url(#enquiryFill)"
              dot={{ r: 4, fill: "var(--color-gold)", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
