import { requireApiUser } from "@/lib/auth/api-auth";
import { listPendingAttendanceReviews } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);

    const pending = await listPendingAttendanceReviews(user.organizationId);
    return jsonOk({ pending, count: pending.length });
  } catch (err) {
    return handleApiError(err);
  }
}
