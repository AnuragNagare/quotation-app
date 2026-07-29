import { Award, IndianRupee, Target, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatINR } from "@/lib/format";
import type { ReportsRangeData } from "@/types";

interface ReportsKpiRowProps {
  data: ReportsRangeData;
}

export function ReportsKpiRow({ data }: ReportsKpiRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={IndianRupee}
        label="Total Gross Revenue"
        value={formatINR(data.totalRevenue.value)}
        delta={data.totalRevenue.delta}
        sublabel="vs last period"
      />
      <KpiCard
        icon={Target}
        label="Win / Conversion Rate"
        value={`${data.winRate.value}%`}
        delta={data.winRate.delta}
        sublabel="pts approved from quotes sent"
      />
      <KpiCard
        icon={Timer}
        label="Avg. Deal Closure Time"
        value={`${data.avgClosureDays.value} Days`}
        delta={data.avgClosureDays.delta}
        sublabel="faster, enquiry to approval"
      />

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Top Revenue Source</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {data.topSegment.label}
            </p>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <Award className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-gold-light px-2 py-0.5 text-xs font-bold text-gold-dark">
            {data.topSegment.percentage}% of total revenue
          </span>
        </div>
      </Card>
    </div>
  );
}
