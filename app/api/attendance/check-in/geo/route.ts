import { requireApiUser } from "@/lib/auth/api-auth";
import { checkInWithGeo } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { body, user });

    const { eventId, latitude, longitude } = body;
    if (!eventId || latitude == null || longitude == null) {
      return jsonError("eventId, latitude, and longitude are required", 400);
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return jsonError("latitude and longitude must be valid numbers", 400);
    }

    const result = await checkInWithGeo(user.id, String(eventId), lat, lng);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
