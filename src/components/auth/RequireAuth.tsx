import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export function RequireAuth() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (!loading && profile) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
