import { requireApiUser } from "@/lib/auth/api-auth";
import { getAdminStats } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const stats = await getAdminStats();
    return jsonOk({ stats });
  } catch (err) {
    return handleApiError(err);
  }
}
