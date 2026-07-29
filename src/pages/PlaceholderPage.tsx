import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-extrabold text-charcoal">{title}</h1>
      <p className="text-sm text-muted">{description}</p>

      <Card className="mt-6 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-gold-light text-gold-dark">
          <Icon className="size-7" />
        </div>
        <div>
          <p className="text-lg font-bold text-charcoal">{title} module coming soon</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            This section is on the roadmap. It will follow the same design
            language as the Dashboard once built.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </Card>
    </div>
  );
}
