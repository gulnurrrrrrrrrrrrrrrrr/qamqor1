import type { Role } from "./types";

export const PERMISSIONS = {
  "events.browse": ["volunteer"],
  "events.search": ["volunteer"],
  "events.filter": ["volunteer"],
  "events.apply": ["volunteer"],
  "events.bookmark": ["volunteer"],
  "events.view": ["volunteer"],
  "org.profile.view": ["volunteer"],
  "notifications.receive": ["volunteer"],
  "applications.track": ["volunteer"],
  "attendance.self_checkin": ["volunteer"],
  "attendance.qr_scan": ["volunteer"],
  "certificates.view": ["volunteer"],
  "hours.view": ["volunteer"],
  "trust.view": ["volunteer"],
  "ai.admissions": ["volunteer"],
  "ai.cv": ["volunteer"],
  "ai.motivation": ["volunteer"],
  "profile.manage": ["volunteer", "organization"],
  "skills.manage": ["volunteer"],
  "achievements.view": ["volunteer"],
  "events.create": ["organization"],
  "events.edit": ["organization"],
  "events.delete": ["organization"],
  "volunteers.manage": ["organization"],
  "applications.review": ["organization"],
  "applications.approve": ["organization"],
  "attendance.track": ["organization"],
  "attendance.verify": ["organization"],
  "qr.generate": ["organization"],
  "analytics.org": ["organization"],
  "volunteers.rate": ["organization"],
  "org.profile.manage": ["organization"],
  "volunteers.search": ["organization"],
  "volunteer.trust.view": ["organization"],
  "users.manage": ["admin"],
  "organizations.manage": ["admin"],
  "events.moderate": ["admin"],
  "fraud.review": ["admin"],
  "analytics.platform": ["admin"],
  "accounts.suspend": ["admin"],
  "organizations.verify": ["admin"],
  "reports.manage": ["admin"],
  "settings.system": ["admin"],
  "abuse.review": ["admin"],
  "verification.monitor": ["admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function canAny(role: Role | null, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
