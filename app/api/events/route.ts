import { requireApiUser } from "@/lib/auth/api-auth";
import { listEvents, createEvent } from "@/lib/services/events";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const events = await listEvents({
      search: searchParams.get("search") ?? undefined,
      mode: searchParams.get("mode") ?? undefined,
      verification: searchParams.get("verification") ?? undefined,
      featured: searchParams.get("featured") === "true",
      organizationId: searchParams.get("organizationId") ?? undefined,
    });
    return jsonOk({ events });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization profile", 400);

    const body = await req.json();
    const event = await createEvent({
      organizationId: user.organizationId,
      title: body.title,
      location: body.location,
      mode: body.mode?.toUpperCase() ?? "OFFLINE",
      verification: body.verification?.toUpperCase() ?? "QR",
      trustRequired: Number(body.trustRequired) || 50,
      eventDate: new Date(body.eventDate ?? Date.now()),
      hours: Number(body.hours) || 8,
      maxParticipants: Number(body.maxParticipants) || 20,
      featured: Boolean(body.featured),
      skills: body.skills ?? [],
    });
    return jsonOk({ event }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
