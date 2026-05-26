import { getSessionUser } from "@/lib/auth/session-server";
import type { Role, SessionUser } from "@/lib/auth/types";

export async function requireApiUser(roles?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (roles && !roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}
