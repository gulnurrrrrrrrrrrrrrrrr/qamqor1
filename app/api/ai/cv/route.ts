import { requireApiUser } from "@/lib/auth/api-auth";
import { generateCv } from "@/lib/services/ai";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function POST() {
  try {
    const user = await requireApiUser(["volunteer"]);
    const result = await generateCv(user.id);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
