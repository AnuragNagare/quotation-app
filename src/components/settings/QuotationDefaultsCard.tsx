import { FileSpreadsheet, FileText } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { QuotationOutputFormat } from "@/types";

interface QuotationDefaultsCardProps {
  directOutputFormat: QuotationOutputFormat;
  onDirectOutputFormatChange: (format: QuotationOutputFormat) => void;
  hotelOutputFormat: QuotationOutputFormat;
  onHotelOutputFormatChange: (format: QuotationOutputFormat) => void;
  termsAndConditions: string;
  onTermsChange: (value: string) => void;
}

function OutputFormatRow({
  label,
  description,
  format,
  onChange,
}: {
  label: string;
  description: string;
  format: QuotationOutputFormat;
  onChange: (format: QuotationOutputFormat) => void;
}) {
  const isPdf = format === "pdf";
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-cream-deep bg-cream-soft/50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
          {isPdf ? <FileText className="size-4" /> : <FileSpreadsheet className="size-4" />}
        </div>
        <div>
          <p className="text-sm font-bold text-charcoal">{label}</p>
          <p className="text-xs text-muted">
            {description} — {isPdf ? "ROXY Branded PDF Format" : "Editable Excel Format"}
          </p>
        </div>
      </div>
      <Switch
        checked={isPdf}
        onCheckedChange={(checked) => onChange(checked ? "pdf" : "excel")}
        label={`Toggle ${label} output format`}
      />
    </div>
  );
}

export function QuotationDefaultsCard({
  directOutputFormat,
  onDirectOutputFormatChange,
  hotelOutputFormat,
  onHotelOutputFormatChange,
  termsAndConditions,
  onTermsChange,
}: QuotationDefaultsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Default Quotation & Export Preferences</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <OutputFormatRow
            label="Direct Client Default Output"
            description="PDF for individual clients"
            format={directOutputFormat}
            onChange={onDirectOutputFormatChange}
          />
          <OutputFormatRow
            label="Hotel Partner Default Output"
            description="Excel for hotel partners"
            format={hotelOutputFormat}
            onChange={onHotelOutputFormatChange}
          />
          <p className="text-xs text-muted">
            These defaults automatically pre-populate the output format when a new quotation is
            created for a direct client or hotel partner.
          </p>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Terms & Conditions Template</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <label className="text-xs font-semibold text-charcoal-soft">
            Standard legal text shown in the quotation footer
          </label>
          <Textarea
            rows={8}
            value={termsAndConditions}
            onChange={(e) => onTermsChange(e.target.value)}
            className="flex-1"
          />
          <p className="text-xs text-muted">
            Updating this text automatically pre-populates new quotations created across the
            platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
