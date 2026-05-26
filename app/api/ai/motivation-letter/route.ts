import { requireApiUser } from "@/lib/auth/api-auth";
import { generateMotivationLetter } from "@/lib/services/ai";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function POST(req: Request) {
  try {
    const user = await requireApiUser(["volunteer"]);
    const body = await req.json().catch(() => ({}));
    const result = await generateMotivationLetter(user.id, body.program);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
