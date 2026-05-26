import type { Role } from "./types";

const PUBLIC = ["/", "/onboarding"];
const PREFIX_ROLE: { prefix: string; role: Role }[] = [
  { prefix: "/volunteer", role: "volunteer" },
  { prefix: "/organization", role: "organization" },
  { prefix: "/admin", role: "admin" },
];

const LEGACY_REDIRECTS: Record<string, string> = {
  "/marketplace": "/volunteer/opportunities",
  "/dashboard/volunteer": "/volunteer",
  "/dashboard/organization": "/organization",
};

export function isPublicPath(path: string): boolean {
  return PUBLIC.some((p) => path === p || path.startsWith(p + "/"));
}

export function getRequiredRole(path: string): Role | null {
  for (const { prefix, role } of PREFIX_ROLE) {
    if (path === prefix || path.startsWith(prefix + "/")) return role;
  }
  return null;
}

export function getLegacyRedirect(path: string): string | null {
  if (LEGACY_REDIRECTS[path]) return LEGACY_REDIRECTS[path];
  for (const [from, to] of Object.entries(LEGACY_REDIRECTS)) {
    if (path.startsWith(from + "/")) return to + path.slice(from.length);
  }
  return null;
}
