import { requireApiUser } from "@/lib/auth/api-auth";
import { getOrgAnalytics } from "@/lib/services/organization";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { user });
    if (!user.organizationId) return jsonError("No organization", 400);
    const analytics = await getOrgAnalytics(user.organizationId);
    return jsonOk(analytics);
  } catch (err) {
    return handleApiError(err);
  }
}
