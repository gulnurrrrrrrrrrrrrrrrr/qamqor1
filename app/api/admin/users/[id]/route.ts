import { requireAdmin } from "@/lib/auth/admin-guard";
import { getUserAdminDetail, adminDeleteUser } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    await requireAdmin("users.manage");
    const user = await getUserAdminDetail(params.id);
    return jsonOk({ user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    const admin = await requireAdmin("users.manage");
    await adminDeleteUser(admin.id, params.id);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
