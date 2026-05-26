import { requireApiUser } from "@/lib/auth/api-auth";
import { listUsers, setUserSuspended } from "@/lib/services/admin";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    await requireApiUser(["admin"]);
    const users = await listUsers();
    return jsonOk({ users });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireApiUser(["admin"]);
    const { userId, suspended } = await req.json();
    if (!userId || typeof suspended !== "boolean") return jsonError("userId and suspended required");
    await setUserSuspended(userId, suspended);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
