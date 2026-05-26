import { requireApiUser } from "@/lib/auth/api-auth";
import { listEvents, createEvent } from "@/lib/services/events";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const { searchParams } = new URL(req.url);
    const events = await listEvents({
      search: searchParams.get("search") ?? undefined,
      mode: searchParams.get("mode") ?? undefined,
      verification: searchParams.get("verification") ?? undefined,
      featured: searchParams.get("featured") === "true",
      organizationId: searchParams.get("organizationId") ?? undefined,
    });
    return jsonOk({ events: events ?? [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { body, user });
    if (!user.organizationId) return jsonError("No organization profile", 400);

    const event = await createEvent({
      organizationId: user.organizationId,
      title: String(body.title ?? "Untitled Event"),
      location: String(body.location ?? "TBD"),
      mode: (typeof body.mode === "string" ? body.mode.toUpperCase() : "OFFLINE") as "ONLINE" | "OFFLINE" | "HYBRID",
      verification: (typeof body.verification === "string" ? body.verification.toUpperCase() : "QR") as "QR" | "GEO" | "HYBRID" | "MANUAL",
      trustRequired: Number(body.trustRequired) || 50,
      eventDate: new Date(typeof body.eventDate === "string" ? body.eventDate : Date.now()),
      hours: Number(body.hours) || 8,
      maxParticipants: Number(body.maxParticipants) || 20,
      featured: Boolean(body.featured),
      skills: Array.isArray(body.skills) ? (body.skills as string[]) : [],
    });
    return jsonOk({ event }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
