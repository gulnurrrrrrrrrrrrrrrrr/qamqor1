import { requireApiUser } from "@/lib/auth/api-auth";
import { listUsers, setUserSuspended } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const users = await listUsers();
    return jsonOk({ users: users ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { body, user });
    const userId = typeof body.userId === "string" ? body.userId : "";
    const suspended = body.suspended;
    if (!userId || typeof suspended !== "boolean") {
      return jsonError("userId and suspended required", 400);
    }
    await setUserSuspended(userId, suspended);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
