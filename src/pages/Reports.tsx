import { useState } from "react";
import { CheckCircle2, FileText, X } from "lucide-react";

import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsKpiRow } from "@/components/reports/ReportsKpiRow";
import { RevenueBreakdownChart } from "@/components/reports/RevenueBreakdownChart";
import { LeadSourceConversionChart } from "@/components/reports/LeadSourceConversionChart";
import { EquipmentUtilizationChart } from "@/components/reports/EquipmentUtilizationChart";
import { LossAnalysisCard } from "@/components/reports/LossAnalysisCard";
import {
  ScheduleAutoReportDialog,
  type ReportFormat,
  type ReportFrequency,
} from "@/components/reports/ScheduleAutoReportDialog";
import { reportsDataByRange } from "@/data/mockData";
import type { DateRangeKey } from "@/types";

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function Reports() {
  const [range, setRange] = useState<DateRangeKey>("this_month");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const data = reportsDataByRange[range];

  function addToast(title: string, message: string, type: ToastAlert["type"] = "success") {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleExportExecutivePdf() {
    addToast(
      "Executive Report Exported",
      `Generated a Roxy-branded executive PDF summarizing ${data.label}.`,
      "info"
    );
  }

  function handleConfirmSchedule(frequency: ReportFrequency, format: ReportFormat, email: string) {
    setScheduleOpen(false);
    addToast(
      "Auto-Report Scheduled",
      `${frequency === "weekly" ? "Weekly" : "Monthly"} ${format.toUpperCase()} report will be sent to ${email}.`
    );
  }

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-top-4 fade-in flex max-w-sm items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-soft-lg duration-300"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                t.type === "info"
                  ? "bg-info-light text-info"
                  : t.type === "warning"
                  ? "bg-warning-light text-warning"
                  : "bg-success-light text-success"
              }`}
            >
              {t.type === "info" ? (
                <FileText className="size-5" />
              ) : (
                <CheckCircle2 className="size-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-charcoal">{t.title}</p>
              <p className="mt-0.5 text-xs text-charcoal-soft">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-muted transition-colors hover:text-charcoal"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <ReportsHeader
          range={range}
          onRangeChange={setRange}
          onScheduleAutoReport={() => setScheduleOpen(true)}
          onExportExecutivePdf={handleExportExecutivePdf}
        />

        <ReportsKpiRow data={data} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueBreakdownChart />
          <LeadSourceConversionChart data={data.leadSourceConversion} />
          <EquipmentUtilizationChart data={data.equipmentUtilization} />
          <LossAnalysisCard data={data.lossAnalysis} />
        </div>
      </div>

      <ScheduleAutoReportDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onConfirmSchedule={handleConfirmSchedule}
      />
    </>
  );
}
