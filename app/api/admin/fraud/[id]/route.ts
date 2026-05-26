import { requireApiUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  logApiRoute(req, { body: { id: params.id } });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const report = await prisma.fraudReport.update({
      where: { id: params.id },
      data: { status: "INVESTIGATING" },
    });
    return jsonOk({ report: { id: report.id, status: report.status.toLowerCase() } });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return jsonError("Report not found", 404);
    }
    return handleApiError(err);
  }
}
