import { requireApiUser } from "@/lib/auth/api-auth";
import { getPlatformSettings } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    const settings = await getPlatformSettings();
    return jsonOk({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}
