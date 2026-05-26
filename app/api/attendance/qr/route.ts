import { requireApiUser } from "@/lib/auth/api-auth";
import { generateEventQr } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);

    const body = await req.json().catch(() => ({}));
    const result = await generateEventQr(user.organizationId, body.eventId);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
