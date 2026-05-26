import { requireApiUser } from "@/lib/auth/api-auth";
import { getAdminStats } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    const stats = await getAdminStats();
    return jsonOk({ stats });
  } catch (err) {
    return handleApiError(err);
  }
}
