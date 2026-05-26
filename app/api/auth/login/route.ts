import { loginUser } from "@/lib/services/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return jsonError("Email and password required");

    const user = await loginUser(email, password);
    return jsonOk({ user });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid credentials") {
      return jsonError(err.message, 401);
    }
    return handleApiError(err);
  }
}
