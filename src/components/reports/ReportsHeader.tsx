import { CalendarClock, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportsDataByRange } from "@/data/mockData";
import type { DateRangeKey } from "@/types";

const RANGE_OPTIONS: DateRangeKey[] = ["this_month", "last_month", "this_quarter", "this_year"];

interface ReportsHeaderProps {
  range: DateRangeKey;
  onRangeChange: (range: DateRangeKey) => void;
  onScheduleAutoReport: () => void;
  onExportExecutivePdf: () => void;
}

export function ReportsHeader({
  range,
  onRangeChange,
  onScheduleAutoReport,
  onExportExecutivePdf,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Reports & Business Analytics
        </h1>
        <p className="mt-1 text-sm text-muted">
          Real-time insights into revenue, quotation conversion rates, and channel performance.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={range} onValueChange={(v) => onRangeChange(v as DateRangeKey)}>
          <SelectTrigger className="h-10 w-[220px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {reportsDataByRange[r].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="secondary" onClick={onScheduleAutoReport}>
          <CalendarClock className="size-4" />
          Schedule Auto-Report
        </Button>

        <Button size="lg" onClick={onExportExecutivePdf}>
          <Download className="size-4" />
          Export Executive PDF
        </Button>
      </div>
    </div>
  );
}
