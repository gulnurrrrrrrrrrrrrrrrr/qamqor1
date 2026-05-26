import { requireApiUser } from "@/lib/auth/api-auth";
import { prisma } from "@/lib/prisma";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function GET(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return jsonOk({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        time: n.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
