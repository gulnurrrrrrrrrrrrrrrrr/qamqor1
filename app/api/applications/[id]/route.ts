import type { ApplicationStatus } from "@prisma/client";
import { requireApiUser } from "@/lib/auth/api-auth";
import { updateApplicationStatus } from "@/lib/services/applications";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser(["organization"]);
    const app = await prisma.application.findUnique({
      where: { id: params.id },
      include: { event: true },
    });
    if (!app) return jsonError("Not found", 404);
    if (app.event.organizationId !== user.organizationId) return jsonError("Forbidden", 403);

    const { status } = await req.json();
    const valid: ApplicationStatus[] = ["APPROVED", "REJECTED", "SCREENING", "PENDING", "ACCEPTED", "REVIEWING", "FLAGGED"];
    if (!valid.includes(status)) return jsonError("Invalid status");

    const updated = await updateApplicationStatus(params.id, status);
    return jsonOk({ application: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
