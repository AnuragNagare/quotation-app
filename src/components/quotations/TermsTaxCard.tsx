import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/format";

interface TermsTaxCardProps {
  notes: string;
  onNotesChange: (value: string) => void;
  terms: string;
  onTermsChange: (value: string) => void;
  taxRatePercent: number;
  onTaxToggle: (enabled: boolean) => void;
  subtotal: number;
  tax: number;
  grandTotal: number;
}

export function TermsTaxCard({
  notes,
  onNotesChange,
  terms,
  onTermsChange,
  taxRatePercent,
  onTaxToggle,
  subtotal,
  tax,
  grandTotal,
}: TermsTaxCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms, Notes & Taxes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-charcoal-soft">
            Special Instructions
          </label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Any special requests or event instructions..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-charcoal-soft">Terms</label>
          <Textarea
            rows={3}
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder="Payment terms, cancellation policy..."
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-charcoal">GST 18%</p>
            <p className="text-xs text-muted">Apply tax to this quotation</p>
          </div>
          <Switch
            checked={taxRatePercent > 0}
            onCheckedChange={onTaxToggle}
            label="Toggle GST 18%"
          />
        </div>

        <div className="flex flex-col gap-2 rounded-2xl bg-cream-soft/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-soft">Subtotal</span>
            <span className="font-semibold text-charcoal">{formatINR(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-charcoal-soft">Tax ({taxRatePercent}%)</span>
            <span className="font-semibold text-charcoal">{formatINR(tax)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-charcoal">Grand Total</span>
            <span className="text-2xl font-extrabold text-gold-dark">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
