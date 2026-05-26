import { requireApiUser } from "@/lib/auth/api-auth";
import { getOrgAnalytics } from "@/lib/services/organization";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);
    const analytics = await getOrgAnalytics(user.organizationId);
    return jsonOk(analytics);
  } catch (err) {
    return handleApiError(err);
  }
}
