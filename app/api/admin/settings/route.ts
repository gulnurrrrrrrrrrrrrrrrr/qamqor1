import { requireAdmin } from "@/lib/auth/admin-guard";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("settings.system");
    const settings = await getPlatformSettings();
    return jsonOk({ settings: settings ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const admin = await requireAdmin("settings.system");
    const settings = Array.isArray(body.settings) ? body.settings : null;
    if (!settings) return jsonError("settings array required", 400);

    const parsed = settings
      .filter((s): s is { key: string; value: string } => typeof s === "object" && s !== null && "key" in s && "value" in s)
      .map((s) => ({ key: String((s as { key: string }).key), value: String((s as { value: string }).value) }));

    const updated = await updatePlatformSettings(admin.id, parsed);
    return jsonOk({ settings: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
