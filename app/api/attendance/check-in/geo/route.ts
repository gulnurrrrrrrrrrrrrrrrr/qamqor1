import { requireApiUser } from "@/lib/auth/api-auth";
import { checkInWithGeo } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const { eventId, latitude, longitude } = await req.json();
    if (!eventId || latitude == null || longitude == null) {
      return jsonError("eventId, latitude, and longitude are required");
    }

    const result = await checkInWithGeo(user.id, eventId, Number(latitude), Number(longitude));
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
