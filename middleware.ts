import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { ROLE_HOME, type Role } from "@/lib/auth/types";
import { getLegacyRedirect, getRequiredRole, isPublicPath } from "@/lib/auth/route-access";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacy = getLegacyRedirect(pathname);
  if (legacy) return NextResponse.redirect(new URL(legacy, request.url));

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/onboarding" && hasSession && !request.nextUrl.searchParams.get("switch")) {
    const role = request.cookies.get("qamqor_role")?.value as Role | undefined;
    if (role && ROLE_HOME[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
  }

  if (isPublicPath(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const required = getRequiredRole(pathname);
  if (!required) return NextResponse.next();

  if (!hasSession) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const role = request.cookies.get("qamqor_role")?.value as Role | undefined;
  if (role && role !== required) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
