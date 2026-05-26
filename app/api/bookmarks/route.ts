import { requireApiUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/prisma";
import { toAppEvent } from "@/lib/mappers/event";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: { event: { include: { organization: true, applications: true } } },
    });
    return jsonOk({ events: bookmarks.map((b) => toAppEvent(b.event)) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { body, user });
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    if (!eventId) return jsonError("eventId required", 400);

    await prisma.bookmark.upsert({
      where: { userId_eventId: { userId: user.id, eventId } },
      create: { userId: user.id, eventId },
      update: {},
    });
    return jsonOk({ ok: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
