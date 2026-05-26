import type { SessionUser } from "@/lib/auth/types";

export function logApiRoute(
  req: Request,
  extra?: { body?: unknown; user?: SessionUser | null }
) {
  const { pathname } = new URL(req.url);
  const payload: Record<string, unknown> = {};
  if (extra?.body !== undefined) payload.body = extra.body;
  if (extra?.user) {
    payload.user = { id: extra.user.id, role: extra.user.role, organizationId: extra.user.organizationId };
  }
  console.log(`[API] ${req.method} ${pathname}`, Object.keys(payload).length ? payload : "");
}

export async function parseJsonBody(req: Request): Promise<Record<string, unknown>> {
  if (req.method === "GET" || req.method === "HEAD") return {};
  try {
    const data = await req.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
