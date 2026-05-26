import { requireApiUser } from "@/lib/auth/api-auth";
import { getEventById, updateEvent, deleteEvent } from "@/lib/services/events";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    const event = await getEventById(params.id);
    if (!event) return jsonError("Not found", 404);
    return jsonOk({ event });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser(["organization", "admin"]);
    const existing = await prisma.event.findUnique({
      where: { id: params.id },
      include: { organization: true },
    });
    if (!existing) return jsonError("Not found", 404);
    if (user.role === "organization" && existing.organizationId !== user.organizationId) {
      return jsonError("Forbidden", 403);
    }

    const body = await req.json();
    const event = await updateEvent(params.id, {
      ...(body.title && { title: body.title }),
      ...(body.location && { location: body.location }),
      ...(body.mode && { mode: body.mode.toUpperCase() }),
      ...(body.hours && { hours: Number(body.hours) }),
    });
    return jsonOk({ event });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser(["organization", "admin"]);
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
