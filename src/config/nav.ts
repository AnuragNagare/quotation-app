import type { LucideIcon } from "lucide-react";
import { Store, Tag, Inbox, Users, FileText } from "lucide-react";

import type { Role } from "@/types/database";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
}

export const navItems: NavItem[] = [
  { label: "Companies", path: "/companies", icon: Store, roles: ["business_user"] },
  { label: "Catalog", path: "/catalog", icon: Tag, roles: ["business_user"] },
  { label: "Enquiries", path: "/biz/enquiries", icon: Inbox, roles: ["business_user"] },
  { label: "People", path: "/admin/people", icon: Users, roles: ["admin"] },
  { label: "Enquiries", path: "/admin/enquiries", icon: Inbox, roles: ["admin"] },
  { label: "Quotes", path: "/admin/quotes", icon: FileText, roles: ["admin"] },
];
