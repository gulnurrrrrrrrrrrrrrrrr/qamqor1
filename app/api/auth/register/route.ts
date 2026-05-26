import { registerUser } from "@/lib/services/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import type { Role } from "@/lib/auth/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body as {
      email?: string;
      password?: string;
      name?: string;
      role?: Role;
    };

    if (!email || !password || !name || !role) {
      return jsonError("Missing required fields");
    }
    if (!["volunteer", "organization", "admin"].includes(role)) {
      return jsonError("Invalid role");
    }
    if (password.length < 6) {
      return jsonError("Password must be at least 6 characters");
    }

    const user = await registerUser({ email, password, name, role });
    return jsonOk({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "Email already registered") {
      return jsonError(err.message, 409);
    }
    return handleApiError(err);
  }
}
