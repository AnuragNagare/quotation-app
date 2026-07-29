import { Check, Loader2, Clock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DispatchStageItem, DispatchStageStatus } from "@/types";

function StageIcon({ status }: { status: DispatchStageStatus }) {
  if (status === "completed") {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-gold text-white shadow-soft">
        <Check className="size-4" strokeWidth={2.5} />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-gold bg-gold-light">
        {/* Pulse ring */}
        <span className="absolute size-8 animate-ping rounded-full bg-gold opacity-25" />
        <Loader2 className="size-4 animate-spin text-gold-dark" />
      </div>
    );
  }
  // pending
  return (
    <div className="flex size-8 items-center justify-center rounded-full border-2 border-cream-deep bg-white">
      <Clock className="size-3.5 text-muted" />
    </div>
  );
}

interface DispatchTimelineProps {
  stages: DispatchStageItem[];
}

export function DispatchTimeline({ stages }: DispatchTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Dispatch Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          {stages.map((stage, idx) => {
            const isLast = idx === stages.length - 1;

            return (
              <div key={stage.id} className="flex gap-3">
                {/* Icon + connector */}
                <div className="flex flex-col items-center">
                  <StageIcon status={stage.status} />
                  {!isLast && (
                    <div
                      className={cn(
                        "my-1 w-0.5 flex-1 min-h-[28px]",
                        stage.status === "completed"
                          ? "bg-gold"
                          : "bg-cream-deep"
                      )}
                    />
                  )}
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "pb-5 pt-1",
                    isLast && "pb-0"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-bold leading-tight",
                      stage.status === "completed"
                        ? "text-charcoal"
                        : stage.status === "in_progress"
                        ? "text-gold-dark"
                        : "text-muted"
                    )}
                  >
                    {stage.label}
                    {stage.status === "in_progress" && (
                      <span className="ml-2 rounded-md bg-gold-light px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                        Active
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xs",
                      stage.status === "completed"
                        ? "text-charcoal-soft"
                        : "text-muted"
                    )}
                  >
                    {stage.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
