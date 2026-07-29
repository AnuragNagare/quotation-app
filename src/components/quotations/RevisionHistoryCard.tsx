import { Plus } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuotationRevisionEntry } from "@/types";

interface RevisionHistoryCardProps {
  revisions: QuotationRevisionEntry[];
  onCreateRevision: () => void;
}

export function RevisionHistoryCard({ revisions, onCreateRevision }: RevisionHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Version History</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          {revisions.map((rev, idx) => (
            <div key={rev.version} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-2.5 shrink-0 rounded-full",
                    rev.isCurrent ? "bg-gold" : "bg-cream-deep"
                  )}
                />
                {idx !== revisions.length - 1 && (
                  <div className="my-1 w-px flex-1 bg-cream-soft" />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-bold text-charcoal">
                  {rev.version} — {rev.label}
                  {rev.isCurrent && (
                    <span className="ml-1.5 rounded-md bg-gold-light px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-dark">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">Revised on {rev.date}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onCreateRevision}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold px-3 py-2.5 text-sm font-semibold text-gold-dark transition-colors hover:bg-gold-light"
        >
          <Plus className="size-4" />
          Create New Revision
        </button>
      </CardContent>
    </Card>
  );
}
