import { requireApiUser } from "@/lib/auth/api-auth";
import { listFraudReports } from "@/lib/services/admin";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    const reports = await listFraudReports();
    return jsonOk({
      reports: reports.map((r) => ({
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
