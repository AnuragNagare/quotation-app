import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LossReason } from "@/types";

const RANK_COLORS = [
  { bar: "bg-danger", text: "text-danger" },
  { bar: "bg-orange", text: "text-orange" },
  { bar: "bg-amber", text: "text-amber" },
  { bar: "bg-cream-deep", text: "text-charcoal-soft" },
];

interface LossAnalysisCardProps {
  data: LossReason[];
}

export function LossAnalysisCard({ data }: LossAnalysisCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Sales & Quotation Loss Analysis</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-5">
        {data.map((reason, idx) => {
          const colors = RANK_COLORS[idx % RANK_COLORS.length];
          return (
            <div key={reason.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-charcoal">{reason.reason}</span>
                <span className={`font-bold ${colors.text}`}>{reason.percentage}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-pill bg-cream-soft">
                <div
                  className={`h-full rounded-pill ${colors.bar}`}
                  style={{ width: `${reason.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="mt-1 text-xs text-muted">Share of all cancelled or lost quotations this period.</p>
      </CardContent>
    </Card>
  );
}
