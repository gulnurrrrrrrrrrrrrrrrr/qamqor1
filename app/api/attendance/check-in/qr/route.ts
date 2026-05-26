import { requireApiUser } from "@/lib/auth/api-auth";
import { checkInWithQr } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const { qrToken } = await req.json();
    if (!qrToken) return jsonError("qrToken is required");

    const result = await checkInWithQr(user.id, qrToken);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
