import { loginUser } from "@/lib/services/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body: { email: body.email } });
  try {
    await ensureDatabaseConnection();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return jsonError("Email and password required", 400);

    const user = await loginUser(email, password);
    return jsonOk({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
