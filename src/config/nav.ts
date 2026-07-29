import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Inbox,
  UserRound,
  Building2,
  FileText,
  PhoneCall,
  CalendarDays,
  Wrench,
  Receipt,
  BarChart3,
  LineChart,
  UserCog,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Enquiries", path: "/enquiries", icon: Inbox },
  { label: "Customers", path: "/customers", icon: UserRound },
  { label: "Hotels", path: "/hotels", icon: Building2 },
  { label: "Quotations", path: "/quotations", icon: FileText },
  { label: "Follow Ups", path: "/follow-ups", icon: PhoneCall },
  { label: "Events", path: "/events", icon: CalendarDays },
  { label: "Equipment", path: "/equipment", icon: Wrench },
  { label: "Invoices", path: "/invoices", icon: Receipt },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Analytics", path: "/analytics", icon: LineChart },
  { label: "Users", path: "/users", icon: UserCog },
  { label: "Settings", path: "/settings", icon: Settings },
];
