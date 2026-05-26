import { getSessionUser } from "@/lib/auth/session-server";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await getSessionUser();
    return jsonOk({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
