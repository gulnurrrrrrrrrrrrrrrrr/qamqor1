import { destroySession } from "@/lib/auth/session-server";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function POST() {
  try {
    await destroySession();
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
