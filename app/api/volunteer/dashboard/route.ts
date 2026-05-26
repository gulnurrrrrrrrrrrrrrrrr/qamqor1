import { requireApiUser } from "@/lib/auth/api-auth";
import { getVolunteerDashboard } from "@/lib/services/volunteer";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["volunteer"]);
    const dashboard = await getVolunteerDashboard(user.id);
    return jsonOk(dashboard);
  } catch (err) {
    return handleApiError(err);
  }
}
