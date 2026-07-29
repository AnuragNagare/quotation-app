import { IndianRupee, Percent } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TaxesFinancialsCardProps {
  gstRatePercent: number;
  onGstRateChange: (value: number) => void;
  invoicePrefix: string;
  onInvoicePrefixChange: (value: string) => void;
  paymentReminderDays: number;
  onPaymentReminderDaysChange: (value: number) => void;
}

export function TaxesFinancialsCard({
  gstRatePercent,
  onGstRateChange,
  invoicePrefix,
  onInvoicePrefixChange,
  paymentReminderDays,
  onPaymentReminderDaysChange,
}: TaxesFinancialsCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="size-4 text-gold-dark" />
            <CardTitle>Default Tax Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              Default GST Tax Rate (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={gstRatePercent}
              onChange={(e) => onGstRateChange(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
            <p className="text-xs text-muted">
              Applied automatically to every new quotation created across the platform.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">Base Currency</label>
            <div className="flex h-10 items-center gap-2 rounded-xl border border-cream-deep bg-cream-soft/50 px-3.5 text-sm font-semibold text-charcoal-soft">
              <IndianRupee className="size-3.5 text-muted" />
              Indian Rupee (₹ INR)
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoicing & Payments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              Invoice Number Prefix
            </label>
            <Input
              value={invoicePrefix}
              onChange={(e) => onInvoicePrefixChange(e.target.value)}
              placeholder="e.g. TT-2026"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-charcoal-soft">
              Payment Reminder — Days Before Due Date
            </label>
            <Input
              type="number"
              min={0}
              value={paymentReminderDays}
              onChange={(e) =>
                onPaymentReminderDaysChange(Math.max(0, Number(e.target.value)))
              }
            />
            <p className="text-xs text-muted">
              Automated reminders are sent this many days before an invoice's due date.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
