import { requireApiUser } from "@/lib/auth/api-auth";
import { listApplicationsForUser, listApplicationsForOrg, createApplication } from "@/lib/services/applications";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser();
    logApiRoute(req, { user });
    if (user.role === "volunteer") {
      const applications = await listApplicationsForUser(user.id);
      return jsonOk({ applications: applications ?? [] });
    }
    if (user.role === "organization" && user.organizationId) {
      const applications = await listApplicationsForOrg(user.organizationId);
      return jsonOk({ applications: applications ?? [] });
    }
    return jsonOk({ applications: [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { body, user });
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    if (!eventId) return jsonError("eventId required", 400);

    const application = await createApplication(user.id, eventId);
    return jsonOk({ application }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
