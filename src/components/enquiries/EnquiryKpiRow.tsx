import type { ReactNode } from "react";
import { Inbox, FileText, Clock, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { enquiryKpis } from "@/data/mockData";
import { formatSignedPercent } from "@/lib/format";

function KpiShell({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal">{value}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function EnquiryKpiRow() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <KpiShell icon={Inbox} label="Total Enquiries This Month" value={enquiryKpis.totalThisMonth.value.toString()}>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-success-light px-1.5 py-0.5 text-xs font-semibold text-success">
          <ArrowUpRight className="size-3" />
          {formatSignedPercent(enquiryKpis.totalThisMonth.delta)}
        </span>
        <span className="ml-1.5 text-xs font-semibold text-muted">vs last month</span>
      </KpiShell>

      <KpiShell icon={FileText} label="Pending Quotes" value={enquiryKpis.pendingQuotes.value.toString()}>
        <Badge variant="gold">Pending</Badge>
      </KpiShell>

      <KpiShell icon={Clock} label="Avg. Response Time" value={`${enquiryKpis.avgResponseMins.value} mins`}>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-success-light px-1.5 py-0.5 text-xs font-semibold text-success">
          <ArrowDownRight className="size-3" />
          {enquiryKpis.avgResponseMins.delta}%
        </span>
        <span className="ml-1.5 text-xs font-semibold text-muted">vs last month</span>
      </KpiShell>

      <KpiShell icon={TrendingUp} label="Conversion Rate" value={`${enquiryKpis.conversionRate.value}%`}>
        <span className="inline-flex items-center gap-0.5 rounded-md bg-success-light px-1.5 py-0.5 text-xs font-semibold text-success">
          <ArrowUpRight className="size-3" />
          {formatSignedPercent(enquiryKpis.conversionRate.delta)}
        </span>
        <span className="ml-1.5 text-xs font-semibold text-muted">vs last month</span>
      </KpiShell>
    </div>
  );
}
