import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  const [users, organizations, events, fraudReports, suspended] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.event.count(),
    prisma.fraudReport.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { suspended: true } }),
  ]);
  return { users, organizations, events, fraudReports, suspended };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { organization: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role.toLowerCase(),
    status: u.suspended ? "suspended" : "active",
    email: u.email,
  }));
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function listFraudReports() {
  return prisma.fraudReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { reportedUser: true, organization: true },
  });
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  return prisma.user.update({ where: { id: userId }, data: { suspended } });
}

export async function verifyOrganization(organizationId: string) {
  return prisma.organization.update({ where: { id: organizationId }, data: { verified: true } });
}

export async function getPlatformSettings() {
  return prisma.platformSetting.findMany();
}
