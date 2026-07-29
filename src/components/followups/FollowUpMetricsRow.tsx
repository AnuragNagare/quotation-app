import { AlarmClockCheck, AlertTriangle, FileClock, Timer } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

interface FollowUpMetricsRowProps {
  dueToday: number;
  highPriority: number;
  pendingQuotesCount: number;
  pendingQuotesValue: number;
  avgConversionDays: number;
  overdueCount: number;
}

export function FollowUpMetricsRow({
  dueToday,
  highPriority,
  pendingQuotesCount,
  pendingQuotesValue,
  avgConversionDays,
  overdueCount,
}: FollowUpMetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Today's Follow-ups</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {dueToday} <span className="text-base font-semibold text-muted">Due Today</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            <AlarmClockCheck className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-danger-light px-2 py-0.5 text-xs font-bold text-danger">
            {highPriority} High Priority
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Pending Approval Quotes</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {pendingQuotesCount} <span className="text-base font-semibold text-muted">Quotes</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-info-light text-info">
            <FileClock className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-info-light px-2 py-0.5 text-xs font-bold text-info">
            Total Value {formatINR(pendingQuotesValue)}
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Avg. Conversion Time</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {avgConversionDays} <span className="text-base font-semibold text-muted">Days</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-light text-purple">
            <Timer className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-purple-light px-2 py-0.5 text-xs font-bold text-purple">
            Quote Sent → Approved
          </span>
        </div>
      </Card>

      <Card className="p-6 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">Overdue Follow-ups</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-charcoal sm:text-3xl">
              {overdueCount} <span className="text-base font-semibold text-muted">Quotes</span>
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-danger-light text-danger">
            <AlertTriangle className="size-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="rounded-md bg-danger-light px-2 py-0.5 text-xs font-bold text-danger">
            Needs Immediate Contact
          </span>
        </div>
      </Card>
    </div>
  );
}
