import { ChevronRight } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { recentQuotations } from "@/data/mockData";
import { formatINR } from "@/lib/format";
import type { QuotationStatus } from "@/types";
import type { VariantProps } from "class-variance-authority";

const STATUS_LABEL: Record<QuotationStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  pending: "Pending",
  approved: "Approved",
  cancelled: "Cancelled",
  revision: "Revision",
};

const STATUS_VARIANT: Record<
  QuotationStatus,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  draft: "default",
  sent: "info",
  pending: "warning",
  approved: "success",
  cancelled: "danger",
  revision: "outline",
};

export function RecentQuotationsTable() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Quotations</CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <ChevronRight className="size-3.5" />
        </Button>
      </CardHeader>
      <div className="overflow-x-auto px-2 pb-2">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold text-muted">
              <th className="px-4 py-3 font-semibold">Quotation No.</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentQuotations.map((q) => (
              <tr
                key={q.id}
                className="cursor-pointer rounded-xl text-sm transition-colors hover:bg-cream-soft"
              >
                <td className="px-4 py-3 font-semibold text-charcoal">{q.number}</td>
                <td className="px-4 py-3 text-charcoal-soft">{q.customer}</td>
                <td className="px-4 py-3 text-charcoal-soft">
                  {q.clientType === "direct" ? "Direct Client" : "Hotel"}
                </td>
                <td className="px-4 py-3 font-semibold text-charcoal">
                  {formatINR(q.amount)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[q.status]}>
                    {STATUS_LABEL[q.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{q.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
