import { requireApiUser } from "@/lib/auth/api-auth";
import { generateEventQr } from "@/lib/services/attendance";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { body, user });
    if (!user.organizationId) return jsonError("No organization", 400);

    const eventId = typeof body.eventId === "string" ? body.eventId : undefined;
    const result = await generateEventQr(user.organizationId, eventId);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
