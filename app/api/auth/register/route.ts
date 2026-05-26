import { registerUser } from "@/lib/services/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { logApiRoute, parseJsonBody } from "@/lib/api/route-utils";
import { ensureDatabaseConnection } from "@/lib/prisma";
import { isAdminEmailAllowed } from "@/lib/auth/admin-guard";
import type { Role } from "@/lib/auth/types";

export async function POST(req: Request) {
  const body = await parseJsonBody(req);
  logApiRoute(req, { body: { email: body.email, role: body.role } });
  try {
    await ensureDatabaseConnection();
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name : "";
    const role = body.role as Role | undefined;

    if (!email || !password || !name || !role) {
      return jsonError("Missing required fields", 400);
    }
    if (!["volunteer", "organization"].includes(role)) {
      if (role === "admin") {
        return jsonError("Admin accounts cannot be registered publicly. Contact platform operators.", 403);
      }
      return jsonError("Invalid role", 400);
    }
    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters", 400);
    }

    const user = await registerUser({ email, password, name, role });
    return jsonOk({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
