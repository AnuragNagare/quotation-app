import {
  Inbox,
  UserPlus,
  FileText,
  CalendarClock,
  CalendarDays,
  Receipt,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickAction {
  icon: LucideIcon;
  label: string;
}

const ACTIONS: QuickAction[] = [
  { icon: Inbox, label: "Create Enquiry" },
  { icon: UserPlus, label: "Create Customer" },
  { icon: FileText, label: "Generate Quotation" },
  { icon: CalendarClock, label: "Schedule Follow-up" },
  { icon: CalendarDays, label: "Create Event" },
  { icon: Receipt, label: "Generate Invoice" },
  { icon: Wrench, label: "Manage Equipment" },
];

export function QuickActions() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 p-6 pt-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-cream-soft p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:bg-gold-light/40 hover:shadow-soft"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gold-light text-gold-dark">
              <action.icon className="size-4" />
            </div>
            <span className="text-xs font-semibold leading-tight text-charcoal-soft">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}
