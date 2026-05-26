import { requireApiUser } from "@/lib/auth/api-auth";
import { removeBookmark } from "@/lib/services/bookmarks";
import { jsonOk, handleApiError } from "@/lib/api/response";

type Params = { params: { eventId: string } };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser(["volunteer"]);
    await removeBookmark(user.id, params.eventId);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
