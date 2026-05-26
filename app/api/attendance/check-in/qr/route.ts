import { requireApiUser } from "@/lib/auth/api-auth";
import { checkInWithQr } from "@/lib/services/attendance";
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

    const qrToken = typeof body.qrToken === "string" ? body.qrToken.trim() : "";
    if (!qrToken) return jsonError("qrToken is required", 400);

    const result = await checkInWithQr(user.id, qrToken);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
