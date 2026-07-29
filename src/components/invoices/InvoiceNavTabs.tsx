import { cn } from "@/lib/utils";

export type InvoiceTabType = "hotel" | "direct" | "all";

interface InvoiceNavTabsProps {
  activeTab: InvoiceTabType;
  onTabChange: (tab: InvoiceTabType) => void;
}

const TABS: { id: InvoiceTabType; label: string }[] = [
  { id: "hotel", label: "Hotel Partners (EOM Batching)" },
  { id: "direct", label: "Direct Clients (Daily Jobs)" },
  { id: "all", label: "All Invoices" },
];

export function InvoiceNavTabs({ activeTab, onTabChange }: InvoiceNavTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-soft border border-black/[0.03]">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200",
              isActive
                ? "bg-gold text-white shadow-soft"
                : "text-charcoal-soft hover:bg-cream-soft hover:text-charcoal"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
