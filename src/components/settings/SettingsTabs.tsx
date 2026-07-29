import { Building2, FileText, Percent, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SettingsTab = "team" | "quotation" | "tax" | "company";

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "team", label: "Team & Permissions", icon: Users },
  { id: "quotation", label: "Quotation & Templates", icon: FileText },
  { id: "tax", label: "Taxes & Financials", icon: Percent },
  { id: "company", label: "Company Profile", icon: Building2 },
];

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-black/[0.03] bg-white p-1.5 shadow-soft scrollbar-thin">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 sm:text-sm",
              isActive
                ? "bg-gold text-white shadow-soft"
                : "text-charcoal-soft hover:bg-cream-soft hover:text-charcoal"
            )}
          >
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
