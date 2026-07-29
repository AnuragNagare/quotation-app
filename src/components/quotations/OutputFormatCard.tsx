import { FileSpreadsheet, FileText } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ClientType } from "@/types";

export function OutputFormatCard({ clientType }: { clientType: ClientType }) {
  const isDirect = clientType === "direct";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Output Format</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 rounded-2xl border border-cream-deep bg-cream-soft/50 p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
            {isDirect ? <FileText className="size-6" /> : <FileSpreadsheet className="size-6" />}
          </div>
          <div>
            <p className="text-sm font-bold text-charcoal">
              {isDirect ? "Roxy Branded PDF" : "Editable Excel Sheet"}
            </p>
            <p className="text-xs text-muted">
              {isDirect
                ? "Sent directly to the client as a finished PDF."
                : "Hotel partner can edit and rebrand before forwarding."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
