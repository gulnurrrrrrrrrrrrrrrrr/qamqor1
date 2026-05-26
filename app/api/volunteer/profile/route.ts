import { requireApiUser } from "@/lib/auth/api-auth";
import { getVolunteerDashboard, updateVolunteerProfile } from "@/lib/services/volunteer";
import { prisma } from "@/lib/prisma";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const dashboard = await getVolunteerDashboard(user.id);
    return jsonOk({
      name: dbUser?.name ?? user.name,
      email: dbUser?.email ?? user.email,
      skills: dashboard.skills ?? [],
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
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { body, user });
    await updateVolunteerProfile(user.id, {
      name: typeof body.name === "string" ? body.name : undefined,
      skills: Array.isArray(body.skills) ? (body.skills as { name: string; value: number }[]) : undefined,
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
