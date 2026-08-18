import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  Plus,
  Receipt,
  Search,
  Settings,
  UserRound,
  Wrench,
  BarChart3,
  Building2,
  PhoneCall,
  LineChart,
  UserCog,
} from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { recentQuotations } from "@/data/mockData";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  action: () => void;
  group: string;
}

// ── Hook: open/close ──────────────────────────────────────────────────────────

export function useCommandBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CommandBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function go(path: string) {
    navigate(path);
    onOpenChange(false);
    setQuery("");
  }

  // Build command list
  const allCommands: CommandItem[] = [
    // Quick actions
    { id: "new-enquiry",    label: "New Enquiry",      sublabel: "Add an incoming lead",          icon: Plus,          group: "Quick Actions", action: () => go("/enquiries") },
    { id: "new-quotation",  label: "New Quotation",    sublabel: "Open quotation builder",        icon: FileText,      group: "Quick Actions", action: () => go("/quotations") },
    { id: "add-customer",   label: "Add Customer",     sublabel: "Create a new customer account", icon: UserRound,     group: "Quick Actions", action: () => go("/customers") },
    { id: "add-equipment",  label: "Add Equipment",    sublabel: "Add item to catalog",           icon: Wrench,        group: "Quick Actions", action: () => go("/equipment") },
    // Navigation
    { id: "nav-dashboard",  label: "Dashboard",        icon: LayoutDashboard, group: "Navigate", action: () => go("/") },
    { id: "nav-enquiries",  label: "Enquiries",        icon: Inbox,           group: "Navigate", action: () => go("/enquiries") },
    { id: "nav-customers",  label: "Customers",        icon: UserRound,       group: "Navigate", action: () => go("/customers") },
    { id: "nav-hotels",     label: "Hotels",           icon: Building2,       group: "Navigate", action: () => go("/hotels") },
    { id: "nav-quotations", label: "Quotations",       icon: FileText,        group: "Navigate", action: () => go("/quotations") },
    { id: "nav-followups",  label: "Follow Ups",       icon: PhoneCall,       group: "Navigate", action: () => go("/follow-ups") },
    { id: "nav-events",     label: "Events",           icon: CalendarDays,    group: "Navigate", action: () => go("/events") },
    { id: "nav-equipment",  label: "Equipment",        icon: Wrench,          group: "Navigate", action: () => go("/equipment") },
    { id: "nav-invoices",   label: "Invoices",         icon: Receipt,         group: "Navigate", action: () => go("/invoices") },
    { id: "nav-reports",    label: "Reports",          icon: BarChart3,       group: "Navigate", action: () => go("/reports") },
    { id: "nav-analytics",  label: "Analytics",        icon: LineChart,       group: "Navigate", action: () => go("/analytics") },
    { id: "nav-users",      label: "Users",            icon: UserCog,         group: "Navigate", action: () => go("/users") },
    { id: "nav-settings",   label: "Settings",         icon: Settings,        group: "Navigate", action: () => go("/settings") },
    // Recent quotations
    ...recentQuotations.map((q) => ({
      id: `quot-${q.id}`,
      label: q.number,
      sublabel: `${q.customer} · ${q.status}`,
      icon: FileText,
      group: "Recent Quotations",
      action: () => go("/quotations"),
    })),
  ];

  const filtered = query.trim().length === 0
    ? allCommands
    : allCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        (cmd.sublabel?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        cmd.group.toLowerCase().includes(query.toLowerCase())
      );

  // Group the filtered items
  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  // Flat index for keyboard nav
  const flatFiltered = filtered;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flatFiltered[activeIndex]?.action();
    }
  }

  let flatIdx = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0 shadow-soft-lg">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-cream-soft px-4 py-3">
          <Search className="size-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions, quotations..."
            className="flex-1 bg-transparent text-sm font-medium text-charcoal outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-muted sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin p-2">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">No results for &quot;{query}&quot;</p>
          )}

          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="mb-1">
              <p className="mb-1 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-widest text-muted">
                {groupName}
              </p>
              {items.map((cmd) => {
                flatIdx++;
                const currentIdx = flatIdx;
                const isActive = activeIndex === currentIdx;
                return (
                  <button
                    key={cmd.id}
                    onMouseEnter={() => setActiveIndex(currentIdx)}
                    onClick={() => cmd.action()}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isActive ? "bg-gold-light" : "hover:bg-cream-soft"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        isActive ? "bg-gold text-white" : "bg-cream-soft text-charcoal-soft"
                      )}
                    >
                      <cmd.icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal">{cmd.label}</p>
                      {cmd.sublabel && (
                        <p className="truncate text-xs text-muted">{cmd.sublabel}</p>
                      )}
                    </div>
                    {isActive && <ArrowRight className="size-4 shrink-0 text-gold-dark" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-cream-soft px-4 py-2">
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <kbd className="rounded bg-cream-soft px-1 py-0.5 font-mono text-[10px]">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <kbd className="rounded bg-cream-soft px-1 py-0.5 font-mono text-[10px]">↵</kbd> open
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted">
            <kbd className="rounded bg-cream-soft px-1 py-0.5 font-mono text-[10px]">ESC</kbd> close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
