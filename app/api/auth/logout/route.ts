import { destroySession } from "@/lib/auth/session-server";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";

export async function POST(req: Request) {
  logApiRoute(req);
  try {
    await destroySession();
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
