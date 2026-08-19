import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <div className="min-h-svh bg-cream">
      <Sidebar />
      <div className="lg:pl-64">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-6 sm:px-8">
          <Header />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
