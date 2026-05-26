import { requireApiUser } from "@/lib/auth/api-auth";
import { listOrganizations, verifyOrganization } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    const organizations = await listOrganizations();
    return jsonOk({
      organizations: organizations.map((o) => ({
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
  try {
    await requireApiUser(["admin"]);
    const { organizationId, action } = await req.json();
    if (!organizationId || action !== "verify") return jsonError("Invalid request");
    await verifyOrganization(organizationId);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
