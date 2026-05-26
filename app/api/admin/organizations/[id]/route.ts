import { requireAdmin } from "@/lib/auth/admin-guard";
import { getOrganizationAdminDetail } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    await requireAdmin("organizations.manage");
    const organization = await getOrganizationAdminDetail(params.id);
    return jsonOk({ organization });
  } catch (err) {
    return handleApiError(err);
  }
}
