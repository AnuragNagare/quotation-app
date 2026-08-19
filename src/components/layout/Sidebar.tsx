import { NavLink } from "react-router-dom";
import { Headset } from "lucide-react";

import { navItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/database";

export function Sidebar() {
  const { profile } = useAuth();
  const visibleNavItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role as Role)
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/[0.04] bg-white px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gold text-white shadow-soft">
          <span className="text-lg font-extrabold">R</span>
        </div>
        <div>
          <p className="text-lg font-extrabold leading-none text-charcoal">ROXY</p>
          <p className="text-[11px] font-medium text-muted">Events. Perfected.</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-gold-light text-gold-dark"
                  : "text-charcoal-soft hover:bg-cream-soft hover:text-charcoal"
              )
            }
          >
            <item.icon className="size-[18px]" strokeWidth={2.25} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-2xl bg-cream-soft p-4">
        <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-white text-gold shadow-soft">
          <Headset className="size-4" />
        </div>
        <p className="text-sm font-bold text-charcoal">Need Help?</p>
        <p className="mb-3 text-xs text-muted">We're here to help</p>
        <button className="w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-charcoal shadow-soft transition-transform hover:-translate-y-0.5">
          Contact Support
        </button>
      </div>
    </aside>
  );
}
