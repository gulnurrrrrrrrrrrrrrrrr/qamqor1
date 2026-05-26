import { getSessionUser } from "@/lib/auth/session-server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await getSessionUser();
    logApiRoute(req, { user });
    return jsonOk({ user });
  } catch (err) {
    console.error("[API] /api/auth/me — returning null user after error", err);
    return jsonOk({ user: null });
  }
}
