import { requireApiUser } from "@/lib/auth/api-auth";
import { listNotifications } from "@/lib/services/notifications";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["volunteer"]);
    const notifications = await listNotifications(user.id);
    return jsonOk({ notifications });
  } catch (err) {
    return handleApiError(err);
  }
}
