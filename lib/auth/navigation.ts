import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  QrCode,
  Award,
  Sparkles,
  User,
  Bell,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Building2,
  Settings,
  AlertTriangle,
} from "lucide-react";
import type { Role } from "./types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

const volunteerNav: NavItem[] = [
  { href: "/volunteer", label: "Passport", icon: LayoutDashboard },
  { href: "/volunteer/opportunities", label: "Opportunities", icon: Search },
  { href: "/volunteer/applications", label: "Applications", icon: FileText },
  { href: "/volunteer/saved", label: "Saved", icon: Bookmark },
  { href: "/volunteer/check-in", label: "Check-in", icon: QrCode },
  { href: "/volunteer/certificates", label: "Certificates", icon: Award },
  { href: "/volunteer/ai-suite", label: "AI Admissions", icon: Sparkles },
  { href: "/volunteer/profile", label: "Profile", icon: User },
  { href: "/volunteer/notifications", label: "Notifications", icon: Bell },
];

const organizationNav: NavItem[] = [
  { href: "/organization", label: "Overview", icon: LayoutDashboard },
  { href: "/organization/events", label: "Events", icon: Calendar },
  { href: "/organization/applications", label: "Applications", icon: FileText },
  { href: "/organization/volunteers", label: "Volunteers", icon: Users },
  { href: "/organization/attendance", label: "Attendance", icon: QrCode },
  { href: "/organization/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/organization/profile", label: "Org Profile", icon: Building2 },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "System", icon: Shield },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/attendance", label: "Attendance", icon: QrCode },
  { href: "/admin/fraud", label: "Fraud & Reports", icon: AlertTriangle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  volunteer: volunteerNav,
  organization: organizationNav,
  admin: adminNav,
};

export const ROLE_LABELS: Record<Role, string> = {
  volunteer: "Volunteer",
  organization: "Organization",
  admin: "Administrator",
};

export const ROLE_ACCENT: Record<Role, string> = {
  volunteer: "from-accent/20 to-accent/5 border-accent/20",
  organization: "from-gold/15 to-gold/5 border-gold/20",
  admin: "from-red-500/10 to-ink-800 border-red-500/20",
};
