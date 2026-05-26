import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/constants";
import type { SessionUser } from "@/lib/auth/types";
import { toSessionUser } from "@/lib/mappers/user";

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
    include: { user: { include: { organization: true } } },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  cookieStore.set("qamqor_role", toSessionUser(session.user).role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return toSessionUser(session.user);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await prisma.session.deleteMany({ where: { token } });
    } catch (err) {
      console.error("[Auth] destroySession db error", err);
    }
    cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    cookieStore.set("qamqor_role", "", { path: "/", maxAge: 0 });
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { include: { organization: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        try {
          await prisma.session.delete({ where: { id: session.id } });
        } catch (err) {
          console.error("[Auth] expired session cleanup failed", err);
        }
      }
      return null;
    }

    if (session.user.suspended) return null;
    return toSessionUser(session.user);
  } catch (err) {
    console.error("[Auth] getSessionUser error", err);
    throw err;
  }
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
