import { useEffect, useRef, useState } from "react";
import { CalendarRange, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FollowUpsHeaderProps {
  dateOptions: string[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onLogNewFollowUp: () => void;
}

export function FollowUpsHeader({
  dateOptions,
  selectedDate,
  onSelectDate,
  onLogNewFollowUp,
}: FollowUpsHeaderProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Follow-ups & Reminders Hub
        </h1>
        <p className="mt-1 text-sm text-muted">
          Track quotation responses, schedule client check-ins, and convert pending deals.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div ref={containerRef} className="relative">
          <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
            <CalendarRange className="size-4" />
            {selectedDate ?? "Filter Calendar View"}
          </Button>

          {open && (
            <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-cream-deep bg-white p-2 shadow-soft-lg">
              <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                Jump to date
              </p>
              <button
                onClick={() => {
                  onSelectDate(null);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors hover:bg-cream-soft",
                  !selectedDate && "text-gold-dark"
                )}
              >
                All Dates
                {!selectedDate && <Check className="size-3.5" />}
              </button>
              {dateOptions.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    onSelectDate(date);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors hover:bg-cream-soft",
                    selectedDate === date && "text-gold-dark"
                  )}
                >
                  {date}
                  {selectedDate === date && <Check className="size-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button size="lg" onClick={onLogNewFollowUp}>
          <Plus className="size-4" />
          Log New Follow-up
        </Button>
      </div>
    </div>
  );
}
