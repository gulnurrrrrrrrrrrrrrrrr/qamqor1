import { ensureDatabaseConnection } from "@/lib/prisma";
import { ApiError } from "@/lib/api/errors";
import { getSessionUser } from "@/lib/auth/session-server";
import type { Role, SessionUser } from "@/lib/auth/types";

export async function requireApiUser(roles?: Role[]): Promise<SessionUser> {
  try {
    await ensureDatabaseConnection();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database unavailable";
    throw new ApiError(503, message);
  }

  let user: SessionUser | null;
  try {
    user = await getSessionUser();
  } catch (err) {
    console.error("[Auth] getSessionUser failed", err);
    throw new ApiError(503, "Authentication service unavailable");
  }

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "Forbidden");
  }

  return user;
}
