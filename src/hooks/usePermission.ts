import { useState, useEffect } from "react";
import { currentUser as defaultUser, rolePermissionChecklist as defaultPermissions } from "@/data/mockData";
import { loadStorage, saveStorage } from "@/lib/storage";
import type { UserRole, RolePermissionStatement } from "@/types";

const USER_ROLE_KEY = "roxy_user_role";
const PERMISSIONS_KEY = "roxy_user_permissions";

export function usePermission() {
  const [role, setRoleState] = useState<UserRole>(() =>
    loadStorage(USER_ROLE_KEY, defaultUser.role.toLowerCase() as UserRole)
  );

  const [permissions, setPermissionsState] = useState<RolePermissionStatement[]>(() =>
    loadStorage(PERMISSIONS_KEY, defaultPermissions)
  );

  useEffect(() => {
    saveStorage(USER_ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    saveStorage(PERMISSIONS_KEY, permissions);
  }, [permissions]);

  function setRole(newRole: UserRole) {
    setRoleState(newRole);
  }

  function togglePermission(permId: string) {
    setPermissionsState((prev) =>
      prev.map((p) => (p.id === permId ? { ...p, allowed: !p.allowed } : p))
    );
  }

  function can(action: "edit_pricing" | "dispatch_event" | "mark_paid" | "edit_line_items" | "view_reports"): boolean {
    if (role === "admin") return true;

    if (action === "edit_pricing") {
      const statement = permissions.find((p) => p.id === "perm-5");
      return role === "operations" ? (statement?.allowed ?? false) : false;
    }

    if (action === "dispatch_event") {
      const statement = permissions.find((p) => p.id === "perm-4");
      return role === "operations" ? (statement?.allowed ?? true) : false;
    }

    if (action === "mark_paid") {
      const statement = permissions.find((p) => p.id === "perm-6");
      return role === "finance" ? (statement?.allowed ?? true) : false;
    }

    if (action === "edit_line_items") {
      const statement = permissions.find((p) => p.id === "perm-7");
      return role === "finance" ? (statement?.allowed ?? false) : role === "sales";
    }

    if (action === "view_reports") {
      const statement = permissions.find((p) => p.id === "perm-2");
      return role === "sales" ? (statement?.allowed ?? false) : role === "finance";
    }

    return true;
  }

  return {
    role,
    setRole,
    permissions,
    togglePermission,
    can,
  };
}
