import { requireApiUser } from "@/lib/auth/api-auth";
import { getVolunteerDashboard, updateVolunteerProfile } from "@/lib/services/volunteer";
import { prisma } from "@/lib/prisma";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["volunteer"]);
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const dashboard = await getVolunteerDashboard(user.id);
    return jsonOk({
      name: dbUser?.name,
      email: dbUser?.email,
      skills: dashboard.skills,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const body = await req.json();
    await updateVolunteerProfile(user.id, { name: body.name, skills: body.skills });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
