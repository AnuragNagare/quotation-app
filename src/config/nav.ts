import type { LucideIcon } from "lucide-react";
import { Store, Tag, Inbox, Users } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Companies", path: "/companies", icon: Store },
  { label: "Catalog", path: "/catalog", icon: Tag },
  { label: "Clients", path: "/clients", icon: Users },
  { label: "Enquiries", path: "/enquiries", icon: Inbox },
];
