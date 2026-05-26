export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Map common service errors to HTTP status codes (not 500). */
export function statusForMessage(message: string): number | null {
  const m = message.toLowerCase();
  if (m === "unauthorized" || m === "invalid credentials") return 401;
  if (m === "forbidden") return 403;
  if (m.includes("not found") || m.includes("invalid qr")) return 404;
  if (m.includes("already applied") || m.includes("email already")) return 409;
  if (m.includes("database") || m.includes("connection failed")) return 503;
  if (
    m.includes("required") ||
    m.includes("invalid") ||
    m.includes("must be") ||
    m.includes("outside geofence") ||
    m.includes("trust score") ||
    m.includes("no event") ||
    m.includes("no organization") ||
    m.includes("geo zone") ||
    m.includes("approved for this event") ||
    m.includes("already applied") ||
    m.includes("too low")
  ) {
    return 400;
  }
  return null;
}
