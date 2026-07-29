import { Phone, Mail, MessageCircle, CheckCircle2, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { todayFollowUps } from "@/data/mockData";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { icon: Phone, label: "Call" },
  { icon: Mail, label: "Email" },
  { icon: MessageCircle, label: "WhatsApp" },
  { icon: CheckCircle2, label: "Complete" },
  { icon: CalendarClock, label: "Reschedule" },
];

export function FollowUpPanel() {
  const navigate = useNavigate();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Follow Ups</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/follow-ups")}>
          View All
        </Button>
      </CardHeader>
      <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
        {todayFollowUps.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-cream-soft p-3.5 transition-colors hover:bg-cream-soft/60"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-charcoal">{item.note}</p>
                <p className="mt-0.5 text-xs text-muted">{item.time}</p>
              </div>
              <Badge variant={item.dueLabel === "Today" ? "gold" : "outline"}>
                {item.dueLabel}
              </Badge>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  aria-label={action.label}
                  title={action.label}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg text-charcoal-soft transition-colors",
                    "hover:bg-white hover:text-gold-dark hover:shadow-soft"
                  )}
                >
                  <action.icon className="size-3.5" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
