import { requireApiUser } from "@/lib/auth/api-auth";
import { generateCv } from "@/lib/services/ai";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function POST(req: Request) {
  logApiRoute(req);
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { user });
    const result = await generateCv(user.id);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
