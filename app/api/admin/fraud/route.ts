import { requireApiUser } from "@/lib/auth/api-auth";
import { listFraudReports } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const reports = await listFraudReports();
    return jsonOk({
      reports: (reports ?? []).map((r) => ({
        id: r.id,
        type: r.type,
        user: r.reportedUser?.name ?? r.organization?.name ?? "Unknown",
        severity: r.severity.toLowerCase(),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
