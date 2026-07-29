import { Check, ShieldCheck } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RolePermissionStatement } from "@/types";

interface RolePermissionsMatrixProps {
  statements: RolePermissionStatement[];
  onToggle: (id: string) => void;
}

export function RolePermissionsMatrix({ statements, onToggle }: RolePermissionsMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-gold-dark" />
          <CardTitle>Role Permissions Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-xs text-muted">
          Toggle capabilities on/off per role. Changes take effect immediately after saving.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {statements.map((statement) => (
            <button
              key={statement.id}
              type="button"
              onClick={() => onToggle(statement.id)}
              className={cn(
                "flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors",
                statement.allowed
                  ? "border-gold/30 bg-gold-light/40 hover:bg-gold-light/70"
                  : "border-cream-deep bg-white hover:bg-cream-soft"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                  statement.allowed ? "border-gold bg-gold" : "border-cream-deep bg-white"
                )}
              >
                {statement.allowed && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold leading-snug",
                  statement.allowed ? "text-charcoal" : "text-muted"
                )}
              >
                {statement.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
