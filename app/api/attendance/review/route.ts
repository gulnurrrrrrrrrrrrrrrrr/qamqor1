import { requireApiUser } from "@/lib/auth/api-auth";
import { listPendingAttendanceReviews } from "@/lib/services/attendance";
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

    const pending = await listPendingAttendanceReviews(user.organizationId);
    return jsonOk({ pending, count: pending.length });
  } catch (err) {
    return handleApiError(err);
  }
}
