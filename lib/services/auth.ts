import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { appRoleToPrisma } from "@/lib/mappers/role";
import type { Role } from "@/lib/auth/types";
import { createSession } from "@/lib/auth/session-server";
import { toSessionUser } from "@/lib/mappers/user";

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await hashPassword(input.password);
  const role = appRoleToPrisma(input.role);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      role,
      ...(input.role === "organization"
        ? {
            organization: {
              create: {
                name: `${input.name} Organization`,
                logo: input.name.slice(0, 2).toUpperCase(),
                description: "Organization profile",
              },
            },
          }
        : {}),
    },
    include: { organization: true },
  });

  if (input.role === "volunteer") {
    await seedVolunteerDefaults(user.id);
  }

  return createSession(user.id);
}

async function seedVolunteerDefaults(userId: string) {
  await prisma.notification.createMany({
    data: [
      {
        userId,
        title: "Welcome to Qamqor",
        body: "Complete your profile to improve admissions readiness.",
      },
    ],
  });
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { organization: true },
  });
  if (!user || user.suspended) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return createSession(user.id);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!user) return null;
  return toSessionUser(user);
}
