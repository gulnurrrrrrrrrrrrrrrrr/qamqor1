/** Build the value encoded in event check-in QR codes (full URL with token). */
export function buildCheckInQrValue(checkInUrl: string): string {
  if (typeof window !== "undefined") {
    return new URL(checkInUrl, window.location.origin).href;
  }
  return checkInUrl;
}

/** Extract qrToken from a scanned QR string (URL or raw token). */
export function parseQrToken(scanned: string): string {
  const value = scanned.trim();
  if (!value) throw new Error("Empty QR code");

  try {
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
      const base = typeof window !== "undefined" ? window.location.origin : "http://localhost";
      const url = new URL(value, base);
      const token = url.searchParams.get("token");
      if (token) return token;
    }
  } catch {
    /* use raw value */
  }

  return value;
}
