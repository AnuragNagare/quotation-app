import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { EnquirySource, LeadSourceConversion } from "@/types";

const CHANNEL_COLOR: Record<EnquirySource, string> = {
  whatsapp: "var(--color-success)",
  website: "var(--color-purple)",
  hotel_staff: "var(--color-amber)",
  email: "var(--color-info)",
};

interface ChartRow {
  channel: EnquirySource;
  label: string;
  received: number;
  converted: number;
  winRate: number;
}

function ConversionTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload as ChartRow;

  return (
    <div className="rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-xs shadow-soft-lg">
      <p className="mb-1 font-bold text-charcoal">{row.label}</p>
      <p className="text-charcoal-soft">
        Received: <span className="font-semibold">{row.received}</span>
      </p>
      <p className="text-charcoal-soft">
        Converted: <span className="font-semibold">{row.converted}</span>
      </p>
      <p className="mt-1 font-bold text-gold-dark">{row.winRate}% Win Rate</p>
    </div>
  );
}

interface LeadSourceConversionChartProps {
  data: LeadSourceConversion[];
}

export function LeadSourceConversionChart({ data }: LeadSourceConversionChartProps) {
  const rows: ChartRow[] = data.map((d) => ({
    channel: d.channel,
    label: d.label,
    received: d.received,
    converted: d.converted,
    winRate: Math.round((d.converted / d.received) * 100),
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Lead Source Conversion Matrix</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
              barCategoryGap={18}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={130}
                tick={{ fill: "var(--color-charcoal-soft)", fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip content={ConversionTooltip} cursor={{ fill: "var(--color-cream-soft)" }} />
              <Bar dataKey="winRate" radius={[8, 8, 8, 8]} barSize={18} animationDuration={800}>
                {rows.map((row) => (
                  <Cell key={row.channel} fill={CHANNEL_COLOR[row.channel]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <div key={row.channel} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CHANNEL_COLOR[row.channel] }}
                />
                <span className="font-medium text-charcoal-soft">{row.label}</span>
              </div>
              <span className="font-bold text-charcoal">
                {row.received} received · {row.converted} converted ({row.winRate}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
