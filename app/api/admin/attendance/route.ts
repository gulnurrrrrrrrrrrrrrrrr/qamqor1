import { requireAdmin } from "@/lib/auth/admin-guard";
import { listAttendanceAdmin } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    await requireAdmin("verification.monitor");
    const { searchParams } = new URL(req.url);
    const result = await listAttendanceAdmin({
      eventId: searchParams.get("eventId") ?? undefined,
      suspicious: searchParams.get("suspicious") === "true",
      page: parseInt(searchParams.get("page") ?? "1", 10),
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
