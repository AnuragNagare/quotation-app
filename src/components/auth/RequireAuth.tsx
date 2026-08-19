import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export function RequireAuth() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Keeps clients out of the internal business shell (Dashboard, Enquiries, Settings, …) —
// that surface is for Admin/Business User; clients live in the marketplace + /my-enquiries.
export function RequireInternalUser() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  if (profile?.role === "client") {
    return <Navigate to="/my-enquiries" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (!loading && session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
