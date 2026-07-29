import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { EquipmentUtilizationSlice } from "@/types";

function demandLabel(utilizationPercent: number) {
  if (utilizationPercent >= 80) return "High Demand";
  if (utilizationPercent >= 60) return "Steady Demand";
  if (utilizationPercent >= 40) return "Moderate Demand";
  return "Low Demand";
}

function UtilizationTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const slice = payload[0]?.payload as EquipmentUtilizationSlice;

  return (
    <div className="rounded-xl border border-cream-deep bg-white px-3.5 py-2.5 text-xs shadow-soft-lg">
      <p className="font-bold text-charcoal">{slice.label}</p>
      <p className="text-muted">{demandLabel(slice.utilizationPercent)}</p>
      <p className="font-semibold text-gold-dark">{slice.utilizationPercent}% Utilization</p>
    </div>
  );
}

interface EquipmentUtilizationChartProps {
  data: EquipmentUtilizationSlice[];
}

export function EquipmentUtilizationChart({ data }: EquipmentUtilizationChartProps) {
  const avgUtilization = Math.round(
    data.reduce((sum, d) => sum + d.utilizationPercent, 0) / data.length
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Equipment Asset Utilization</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="relative h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="utilizationPercent"
                nameKey="label"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
                animationDuration={800}
              >
                {data.map((slice) => (
                  <Cell key={slice.id} fill={slice.colorVar} />
                ))}
              </Pie>
              <Tooltip content={UtilizationTooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-extrabold text-charcoal">{avgUtilization}%</p>
            <p className="text-[11px] font-semibold text-muted">Avg Utilization</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.map((slice) => (
            <div key={slice.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: slice.colorVar }} />
                <span className="font-medium text-charcoal-soft">{slice.label}</span>
              </div>
              <span className="font-bold text-charcoal">
                {slice.utilizationPercent}%{" "}
                <span className="font-medium text-muted">
                  · {demandLabel(slice.utilizationPercent)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
