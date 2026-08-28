import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/database";

export function RequireRole({ roles }: { roles: Role[] }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  if (!profile || !roles.includes(profile.role as Role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
