import type { ApplicationStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { listApplicationsAdmin, adminOverrideApplication } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("users.manage");
    const { searchParams } = new URL(req.url);
    const result = await listApplicationsAdmin({
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1", 10),
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const admin = await requireAdmin("users.manage");
    const applicationId = typeof body.applicationId === "string" ? body.applicationId : "";
    const status = typeof body.status === "string" ? body.status.toUpperCase() : "";
    if (!applicationId || !status) return jsonError("applicationId and status required", 400);

    const application = await adminOverrideApplication(admin.id, applicationId, status as ApplicationStatus);
    return jsonOk({ application });
  } catch (err) {
    return handleApiError(err);
  }
}
