import { requireAdmin } from "@/lib/auth/admin-guard";
import { getAdminAnalytics } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("analytics.platform");
    const analytics = await getAdminAnalytics();
    return jsonOk(analytics);
  } catch (err) {
    return handleApiError(err);
  }
}
