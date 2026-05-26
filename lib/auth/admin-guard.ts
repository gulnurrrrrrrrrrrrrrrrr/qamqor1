import type { Permission } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/permissions";
import { requireApiUser } from "@/lib/auth/api-auth";
import { ApiError } from "@/lib/api/errors";
import type { SessionUser } from "@/lib/auth/types";

export async function requireAdmin(permission?: Permission): Promise<SessionUser> {
  const user = await requireApiUser(["admin"]);
  if (permission && !can(user.role, permission)) {
    throw new ApiError(403, "Forbidden");
  }
  return user;
}

export function isAdminEmailAllowed(email: string): boolean {
  const allowed = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!allowed) return false;
  return email.trim().toLowerCase() === allowed;
}
