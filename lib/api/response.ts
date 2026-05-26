import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(err: unknown) {
  console.error(err);
  if (err instanceof Error && err.message === "Unauthorized") {
    return jsonError("Unauthorized", 401);
  }
  if (err instanceof Error && err.message === "Forbidden") {
    return jsonError("Forbidden", 403);
  }
  return jsonError("Internal server error", 500);
}
