import { IndianRupee, CalendarDays, AlertCircle, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

interface InvoiceMetricsRowProps {
  totalRevenue: number;
  revenueDelta: number;
  unbilledEventsCount: number;
  pendingAmount: number;
  overdueCount: number;
}

export function InvoiceMetricsRow({
  totalRevenue,
  revenueDelta,
  unbilledEventsCount,
  pendingAmount,
  overdueCount,
}: InvoiceMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {/* Card 1: Total Revenue */}
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Total Revenue (May)</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {formatINR(totalRevenue)}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <IndianRupee className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-success-light px-1.5 py-0.5 text-success">
            <ArrowUpRight className="size-3" />
            +{revenueDelta}%
          </span>
          <span className="text-muted">vs last month</span>
        </div>
      </Card>

      {/* Card 2: Unbilled Hotel Events */}
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Unbilled Hotel Events</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
                {unbilledEventsCount} Events
              </span>
            </div>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <CalendarDays className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-md bg-gold-light px-2 py-0.5 text-xs font-bold text-gold-dark">
            {unbilledEventsCount} Events
          </span>
          <span className="text-xs font-semibold text-muted">Ready for EOM batching</span>
        </div>
      </Card>

      {/* Card 3: Pending Invoices Amount */}
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Pending Invoices</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {formatINR(pendingAmount)}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-danger-light text-danger">
            <AlertCircle className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-md bg-danger-light px-2 py-0.5 text-xs font-bold text-danger">
            {overdueCount} Overdue
          </span>
          <span className="text-xs font-semibold text-muted">Invoices Pending Action</span>
        </div>
      </Card>
    </div>
  );
}
