import { requireApiUser } from "@/lib/auth/api-auth";
import { configureEventGeo } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);

    const { eventId, latitude, longitude, radiusMeters } = await req.json();
    if (!eventId || latitude == null || longitude == null) {
      return jsonError("eventId, latitude, and longitude are required");
    }

    const result = await configureEventGeo(user.organizationId, {
      eventId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: radiusMeters ? Number(radiusMeters) : undefined,
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
