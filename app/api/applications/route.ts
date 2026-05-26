import { requireApiUser } from "@/lib/auth/api-auth";
import { listApplicationsForUser, listApplicationsForOrg, createApplication } from "@/lib/services/applications";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser();
    if (user.role === "volunteer") {
      const applications = await listApplicationsForUser(user.id);
      return jsonOk({ applications });
    }
    if (user.role === "organization" && user.organizationId) {
      const applications = await listApplicationsForOrg(user.organizationId);
      return jsonOk({ applications });
    }
    return jsonOk({ applications: [] });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const { eventId } = await req.json();
    if (!eventId) return jsonError("eventId required");

    const application = await createApplication(user.id, eventId);
    return jsonOk({ application }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === "Already applied") {
      return jsonError(err.message, 409);
    }
    return handleApiError(err);
  }
}
