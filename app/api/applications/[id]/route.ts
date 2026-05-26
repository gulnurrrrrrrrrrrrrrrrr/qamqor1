import type { ApplicationStatus } from "@prisma/client";
import { requireApiUser } from "@/lib/auth/api-auth";
import { updateApplicationStatus } from "@/lib/services/applications";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body: { ...body, id: params.id } });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { body, user });
    if (!user.organizationId) return jsonError("No organization", 400);

    const app = await prisma.application.findUnique({
      where: { id: params.id },
      include: { event: true },
    });
    if (!app) return jsonError("Not found", 404);
    if (app.event.organizationId !== user.organizationId) return jsonError("Forbidden", 403);

    const status = typeof body.status === "string" ? body.status.toUpperCase() : "";
    const valid: ApplicationStatus[] = ["APPROVED", "REJECTED", "SCREENING", "PENDING", "ACCEPTED", "REVIEWING", "FLAGGED"];
    if (!valid.includes(status as ApplicationStatus)) return jsonError("Invalid status", 400);

    const updated = await updateApplicationStatus(params.id, status as ApplicationStatus);
    return jsonOk({ application: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
