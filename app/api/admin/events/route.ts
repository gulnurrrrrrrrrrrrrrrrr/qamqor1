import { requireAdmin } from "@/lib/auth/admin-guard";
import { listEventsAdmin, moderateEvent } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("events.moderate");
    const { searchParams } = new URL(req.url);
    const result = await listEventsAdmin({
      status: searchParams.get("status") ?? undefined,
      flagged: searchParams.get("flagged") === "true",
      search: searchParams.get("search") ?? undefined,
      page: parseInt(searchParams.get("page") ?? "1", 10),
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const admin = await requireAdmin("events.moderate");
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    const action = typeof body.action === "string" ? body.action : "";
    if (!eventId || !action) return jsonError("eventId and action required", 400);

    const valid = ["approve", "reject", "flag", "unflag"];
    if (!valid.includes(action)) return jsonError("Invalid action", 400);

    const event = await moderateEvent(
      admin.id,
      eventId,
      action as "approve" | "reject" | "flag" | "unflag",
      typeof body.reason === "string" ? body.reason : undefined
    );
    return jsonOk({ event });
  } catch (err) {
    return handleApiError(err);
  }
}
