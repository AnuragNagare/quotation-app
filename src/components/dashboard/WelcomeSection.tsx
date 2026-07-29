import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

const today = new Date().toLocaleDateString("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface WelcomeSectionProps {
  name: string;
  onNewEnquiry: () => void;
}

export function WelcomeSection({ name, onNewEnquiry }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          {getGreeting()}, {name} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here's what's happening with your business today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-charcoal-soft shadow-soft">
          {today}
        </div>
        <Button size="lg" onClick={onNewEnquiry}>
          <Plus className="size-4" />
          New Enquiry
        </Button>
      </div>
    </div>
  );
}
