import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

// RequireInternalUser already keeps clients out of this shell, so the only
// roles that ever land here are business_user and admin — send each to the
// page that's actually theirs rather than maintaining a shared dashboard.
export function Home() {
  const { profile } = useAuth();

  if (profile?.role === "admin") {
    return <Navigate to="/admin/people" replace />;
  }

  return <Navigate to="/companies" replace />;
}
