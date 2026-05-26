import type { FraudStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { updateFraudReport } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body: { ...body, id: params.id } });
  try {
    await ensureDatabaseConnection();
    const admin = await requireAdmin("fraud.review");

    const status = typeof body.status === "string" ? (body.status.toUpperCase() as FraudStatus) : undefined;
    const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes : undefined;
    const assignedToId =
      body.assignedToId === null ? null : typeof body.assignedToId === "string" ? body.assignedToId : undefined;

    if (!status && adminNotes === undefined && assignedToId === undefined) {
      return jsonError("No updates provided", 400);
    }

    const report = await updateFraudReport(admin.id, params.id, {
      status,
      adminNotes,
      assignedToId,
    });

    return jsonOk({
      report: {
        id: report.id,
        status: report.status.toLowerCase(),
        adminNotes: report.adminNotes,
        assignedToId: report.assignedToId,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
