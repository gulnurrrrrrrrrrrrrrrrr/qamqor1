import { requireApiUser } from "@/lib/auth/api-auth";
import { updateOrganization } from "@/lib/services/organization";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { user });
    if (!user.organizationId) return jsonError("No organization", 400);
    const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
    return jsonOk({
      organization: org ?? { id: user.organizationId, name: "", logo: "", description: null, verified: false },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["organization"]);
    logApiRoute(req, { body, user });
    if (!user.organizationId) return jsonError("No organization", 400);
    const org = await updateOrganization(user.organizationId, {
      name: typeof body.name === "string" ? body.name : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      logo: typeof body.logo === "string" ? body.logo : undefined,
    });
    return jsonOk({ organization: org });
  } catch (err) {
    return handleApiError(err);
  }
}
