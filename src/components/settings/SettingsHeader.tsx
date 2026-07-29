import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SettingsHeaderProps {
  onSave: () => void;
}

export function SettingsHeader({ onSave }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-extrabold text-charcoal sm:text-3xl">
          Settings & System Administration
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage team access, role permissions, company branding, and quotation defaults.
        </p>
      </div>

      <Button size="lg" onClick={onSave}>
        <Save className="size-4" />
        Save System Settings
      </Button>
    </div>
  );
}
