import { requireApiUser } from "@/lib/auth/api-auth";
import { listOrganizations, verifyOrganization } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { user });
    const organizations = await listOrganizations();
    return jsonOk({
      organizations: (organizations ?? []).map((o) => ({
        id: o.id,
        name: o.name,
        status: o.verified ? "verified" : "pending",
      })),
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
    const user = await requireApiUser(["admin"]);
    logApiRoute(req, { body, user });
    const organizationId = typeof body.organizationId === "string" ? body.organizationId : "";
    if (!organizationId || body.action !== "verify") {
      return jsonError("Invalid request", 400);
    }
    await verifyOrganization(organizationId);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
