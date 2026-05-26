import { requireApiUser } from "@/lib/auth/api-auth";
import { listBookmarks, addBookmark } from "@/lib/services/bookmarks";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireApiUser(["volunteer"]);
    const events = await listBookmarks(user.id);
    return jsonOk({ events });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const { eventId } = await req.json();
    if (!eventId) return jsonError("eventId required");
    await addBookmark(user.id, eventId);
    return jsonOk({ ok: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
