import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Sidebar, SidebarContent } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandBar, useCommandBar } from "@/components/layout/CommandBar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function AppLayout() {
  const { open, setOpen } = useCommandBar();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-svh bg-cream">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
          <SidebarContent onNavClick={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Viewport */}
      <div className="lg:pl-64">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-6 sm:px-8">
          <Header
            onOpenCommandBar={() => setOpen(true)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
          <Outlet />
        </div>
      </div>
      <CommandBar open={open} onOpenChange={setOpen} />
    </div>
  );
}
