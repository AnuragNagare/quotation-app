import {
  FileText,
  RefreshCw,
  Receipt,
  CheckCircle2,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/data/mockData";
import type { ActivityKind } from "@/types";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  quotation_created: FileText,
  revision_requested: RefreshCw,
  invoice_generated: Receipt,
  quotation_approved: CheckCircle2,
  equipment_assigned: Wrench,
};

const KIND_STYLE: Record<ActivityKind, string> = {
  quotation_created: "bg-info-light text-info",
  revision_requested: "bg-warning-light text-warning",
  invoice_generated: "bg-gold-light text-gold-dark",
  quotation_approved: "bg-success-light text-success",
  equipment_assigned: "bg-cream-soft text-charcoal-soft",
};

export function ActivityTimeline() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 p-6 pt-4">
        {recentActivity.map((activity, idx) => {
          const Icon = KIND_ICON[activity.kind];
          const isLast = idx === recentActivity.length - 1;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    KIND_STYLE[activity.kind]
                  )}
                >
                  <Icon className="size-4" />
                </div>
                {!isLast && <div className="my-1 w-px flex-1 bg-cream-soft" />}
              </div>
              <div className="pb-5">
                <p className="text-sm font-semibold text-charcoal">{activity.message}</p>
                <p className="text-xs text-muted">
                  {activity.user} · {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
