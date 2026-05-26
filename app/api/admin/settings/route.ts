import { requireApiUser } from "@/lib/auth/api-auth";
import { getPlatformSettings } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const settings = await getPlatformSettings();
    return jsonOk({ settings: settings ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}
