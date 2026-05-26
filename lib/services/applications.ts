import type { ApplicationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listApplicationsForUser(userId: string) {
  const apps = await prisma.application.findMany({
    where: { userId },
    include: { event: { include: { organization: true } } },
    orderBy: { createdAt: "desc" },
  });
  return apps.map((a) => ({
    id: a.id,
    event: a.event.title,
    org: a.event.organization.name,
    date: a.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    status: a.status.toLowerCase(),
    eventId: a.eventId,
  }));
}

export async function listApplicationsForOrg(organizationId: string) {
  const apps = await prisma.application.findMany({
    where: { event: { organizationId } },
    include: { user: true, event: true },
    orderBy: { createdAt: "desc" },
  });
  return apps.map((a) => ({
    id: a.id,
    name: a.user.name,
    role: "Volunteer",
    trust: a.user.trustScore,
    status: mapOrgStatus(a.status),
    userId: a.userId,
    eventId: a.eventId,
  }));
}

function mapOrgStatus(status: ApplicationStatus): string {
  const map: Record<string, string> = {
    APPROVED: "approved",
    ACCEPTED: "approved",
    SCREENING: "screening",
    REVIEWING: "screening",
    PENDING: "pending",
    FLAGGED: "flagged",
    REJECTED: "flagged",
  };
  return map[status] ?? "pending";
}

export async function createApplication(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.trustScore < event.trustRequired) throw new Error("Trust score too low");

  const existing = await prisma.application.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  if (existing) throw new Error("Already applied");

  return prisma.application.create({
    data: { userId, eventId, status: "REVIEWING" },
    include: { event: { include: { organization: true } } },
  });
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return prisma.application.update({ where: { id }, data: { status } });
}
