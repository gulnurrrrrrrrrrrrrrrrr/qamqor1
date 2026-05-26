import { requireApiUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

type Params = { params: { id: string } };

export async function PATCH(_req: Request, { params }: Params) {
  try {
    await requireApiUser(["admin"]);
    const report = await prisma.fraudReport.update({
      where: { id: params.id },
      data: { status: "INVESTIGATING" },
    });
    return jsonOk({ report: { id: report.id, status: report.status.toLowerCase() } });
  } catch (err) {
    return handleApiError(err);
  }
}
