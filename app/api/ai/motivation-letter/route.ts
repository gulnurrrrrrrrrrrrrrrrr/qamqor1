import { requireApiUser } from "@/lib/auth/api-auth";
import { generateMotivationLetter } from "@/lib/services/ai";
import { jsonOk, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body });
  try {
    await ensureDatabaseConnection();
    const user = await requireApiUser(["volunteer"]);
    logApiRoute(req, { body, user });
    const program = typeof body.program === "string" ? body.program : undefined;
    const result = await generateMotivationLetter(user.id, program);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
