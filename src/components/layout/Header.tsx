import { Bell, Check, Menu, Search, Shield } from "lucide-react";

import { currentUser } from "@/data/mockData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermission } from "@/hooks/usePermission";
import type { UserRole } from "@/types";

interface HeaderProps {
  onOpenCommandBar?: () => void;
  onOpenMobileNav?: () => void;
}

export function Header({ onOpenCommandBar, onOpenMobileNav }: HeaderProps) {
  const { role, setRole } = usePermission();

  const roleLabels: Record<UserRole, string> = {
    admin: "Admin",
    sales: "Sales Manager",
    operations: "Ops Lead",
    finance: "Finance Specialist",
  };

  return (
    <header className="flex items-center gap-3 sm:gap-4">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={onOpenMobileNav}
        aria-label="Open Navigation Menu"
        className="flex size-10 items-center justify-center rounded-xl bg-white text-charcoal shadow-soft transition-transform hover:-translate-y-0.5 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Search bar — clicking opens the CommandBar */}
      <button
        onClick={onOpenCommandBar}
        className="relative flex w-full max-w-md cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-left shadow-soft transition-transform hover:-translate-y-0.5"
      >
        <Search className="size-4 shrink-0 text-muted" />
        <span className="flex-1 truncate text-sm text-muted">Search anything...</span>
        <kbd className="hidden rounded-md bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-muted sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-xl bg-white text-charcoal-soft shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Bell className="size-[18px]" />
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-2xl bg-white py-1.5 pl-1.5 pr-3 shadow-soft outline-none transition-transform hover:-translate-y-0.5">
            <Avatar className="size-8">
              <AvatarFallback>{currentUser.initials}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-bold text-charcoal">{currentUser.name}</p>
              <p className="text-[11px] font-semibold text-gold-dark capitalize">{roleLabels[role]}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Active Role Selector */}
            <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-muted">
              <Shield className="size-3 text-gold-dark" /> Switch Role (RBAC Demo)
            </DropdownMenuLabel>
            {(["admin", "sales", "operations", "finance"] as UserRole[]).map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRole(r)} className="justify-between text-xs capitalize">
                <span>{roleLabels[r]}</span>
                {role === r && <Check className="size-3.5 text-gold-dark" />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
