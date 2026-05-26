import { requireApiUser } from "@/lib/auth/api-auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/events";
import { prisma, ensureDatabaseConnection } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    const event = await getEventById(params.id);
    if (!event) return jsonError("Not found", 404);
    return jsonOk({ event });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body: { ...body, id: params.id } });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization", "admin"]);
    logApiRoute(req, { body, user });
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
      include: { organization: true },
    });
    if (!existing) return jsonError("Not found", 404);
    if (user.role === "organization" && existing.organizationId !== user.organizationId) {
      return jsonError("Forbidden", 403);
    }

    const patch: Parameters<typeof updateEvent>[1] = {};
    if (body.title) patch.title = String(body.title);
    if (body.description !== undefined) patch.description = body.description ? String(body.description) : null;
    if (body.location) patch.location = String(body.location);
    if (body.mode) patch.mode = String(body.mode).toUpperCase() as "ONLINE" | "OFFLINE" | "HYBRID";
    if (body.verification) patch.verification = String(body.verification).toUpperCase() as "QR" | "GEO" | "HYBRID" | "MANUAL";
    if (body.eventDate) patch.eventDate = new Date(String(body.eventDate));
    if (body.hours != null) patch.hours = Number(body.hours);
    if (body.maxParticipants != null) patch.maxParticipants = Number(body.maxParticipants);
    if (body.trustRequired != null) patch.trustRequired = Number(body.trustRequired);
    if (body.featured != null) patch.featured = Boolean(body.featured);

    const event = await updateEvent(params.id, patch);
    return jsonOk({ event });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization", "admin"]);
    logApiRoute(req, { user });
    const existing = await prisma.event.findUnique({ where: { id: params.id } });
    if (!existing) return jsonError("Not found", 404);
    if (user.role === "organization" && existing.organizationId !== user.organizationId) {
      return jsonError("Forbidden", 403);
    }
    await deleteEvent(params.id);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
