import { requireApiUser } from "@/lib/auth/api-auth";
import { getVolunteerDashboard } from "@/lib/services/volunteer";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    const dashboard = await getVolunteerDashboard(user.id);
    return jsonOk({
      stats: dashboard.stats,
      timeline: dashboard.timeline ?? [],
      skills: dashboard.skills ?? [],
      certificates: dashboard.certificates ?? [],
    });
  } catch (err) {
    return handleApiError(err);
  }
}
