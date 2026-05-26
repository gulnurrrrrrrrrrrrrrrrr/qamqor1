import { requireApiUser } from "@/lib/auth/api-auth";
import { updateOrganization } from "@/lib/services/organization";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);
    const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
    return jsonOk({ organization: org });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireApiUser(["organization"]);
    if (!user.organizationId) return jsonError("No organization", 400);
    const body = await req.json();
    const org = await updateOrganization(user.organizationId, body);
    return jsonOk({ organization: org });
  } catch (err) {
    return handleApiError(err);
  }
}
