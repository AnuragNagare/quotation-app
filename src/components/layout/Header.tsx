import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  business_user: "Business User",
};

export function Header() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const displayName = profile?.full_name || profile?.email || "Account";
  const roleLabel = profile ? ROLE_LABELS[profile.role] ?? profile.role : "";

  async function handleLogOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="flex items-center gap-4">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search anything..."
          className="rounded-2xl bg-white pl-10 pr-14"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-cream-soft px-1.5 py-0.5 text-[10px] font-bold text-muted">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-3">
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
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="text-left leading-tight">
              <p className="text-sm font-bold text-charcoal">{displayName}</p>
              <p className="text-[11px] text-muted">{roleLabel}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
