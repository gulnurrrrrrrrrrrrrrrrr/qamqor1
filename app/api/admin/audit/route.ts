import { requireAdmin } from "@/lib/auth/admin-guard";
import { listAdminActions } from "@/lib/services/admin-audit";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("settings.system");
    const actions = await listAdminActions(100);
    return jsonOk({
      actions: actions.map((a) => ({
        id: a.id,
        action: a.action,
        targetType: a.targetType,
        targetId: a.targetId,
        admin: a.admin.name,
        adminEmail: a.admin.email,
        createdAt: a.createdAt.toISOString(),
        metadata: a.metadata,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
