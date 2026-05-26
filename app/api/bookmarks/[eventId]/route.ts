import { requireApiUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

type Params = { params: { eventId: string } };

export async function DELETE(req: Request, { params }: Params) {
  logApiRoute(req, { body: { eventId: params.eventId } });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    await prisma.bookmark.deleteMany({
      where: { userId: user.id, eventId: params.eventId },
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
