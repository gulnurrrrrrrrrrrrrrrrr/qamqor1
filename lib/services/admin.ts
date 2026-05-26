import type { ApplicationStatus, EventModerationStatus, FraudStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api/errors";
import { logAdminAction } from "@/lib/services/admin-audit";
import { toAppEvent } from "@/lib/mappers/event";

const PAGE_SIZE = 20;

export async function getAdminStats() {
  const [users, organizations, events, fraudReports, suspended, pendingEvents] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.event.count(),
    prisma.fraudReport.count({ where: { status: "OPEN" } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.event.count({ where: { moderationStatus: "PENDING" } }),
  ]);
  return { users, organizations, events, fraudReports, suspended, pendingEvents };
}

export async function listUsersAdmin(params: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, params.limit ?? PAGE_SIZE);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.role && params.role !== "all") {
    where.role = params.role.toUpperCase() as Role;
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { organization: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.toLowerCase(),
      status: u.suspended ? "suspended" : "active",
      trustScore: u.trustScore,
      impactHours: u.impactHours,
      leadershipIndex: u.leadershipIndex,
      createdAt: u.createdAt.toISOString(),
      organizationId: u.organization?.id ?? null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getUserAdminDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      applications: { include: { event: { include: { organization: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
      attendanceRecords: { include: { event: true }, orderBy: { createdAt: "desc" }, take: 20 },
      timeline: { orderBy: { entryDate: "desc" }, take: 10 },
      fraudReports: { take: 10 },
    },
  });
  if (!user) throw new ApiError(404, "User not found");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    suspended: user.suspended,
    trustScore: user.trustScore,
    impactHours: user.impactHours,
    leadershipIndex: user.leadershipIndex,
    admissionsReadiness: user.admissionsReadiness,
    createdAt: user.createdAt.toISOString(),
    organization: user.organization,
    applications: user.applications.map((a) => ({
      id: a.id,
      event: a.event.title,
      org: a.event.organization.name,
      status: a.status.toLowerCase(),
      createdAt: a.createdAt.toISOString(),
    })),
    attendance: user.attendanceRecords.map((r) => ({
      id: r.id,
      event: r.event.title,
      method: r.method,
      latitude: r.latitude,
      longitude: r.longitude,
      createdAt: r.createdAt.toISOString(),
    })),
    timeline: user.timeline,
    fraudReports: user.fraudReports,
  };
}

export async function adminUpdateUser(
  adminId: string,
  userId: string,
  data: { suspended?: boolean; role?: "volunteer" | "organization" }
) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "ADMIN") throw new ApiError(400, "Cannot modify admin accounts");

  if (data.role && data.role !== user.role.toLowerCase()) {
    if (data.role === "organization" && !user.organization) {
      throw new ApiError(400, "User has no organization profile");
    }
    if (data.role === "volunteer" && user.organization) {
      throw new ApiError(400, "Cannot demote organization account with linked org");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.suspended !== undefined && { suspended: data.suspended }),
      ...(data.role && { role: data.role.toUpperCase() as Role }),
    },
  });

  const actionName =
    data.suspended !== undefined
      ? data.suspended
        ? "user.suspend"
        : "user.restore"
      : "user.role_change";
  await logAdminAction(adminId, actionName, "User", userId, data as Record<string, unknown>);
  return updated;
}

export async function adminDeleteUser(adminId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "ADMIN") throw new ApiError(400, "Cannot delete admin accounts");

  await prisma.user.delete({ where: { id: userId } });
  await logAdminAction(adminId, "user.delete", "User", userId);
}

export async function listOrganizationsAdmin(params: { search?: string; status?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }
  if (params.status === "verified") where.verified = true;
  if (params.status === "pending") where.verified = false;
  if (params.status === "suspended") where.suspended = true;
  if (params.status === "rejected") where.rejected = true;

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: true, _count: { select: { events: true } } },
    }),
    prisma.organization.count({ where }),
  ]);

  return {
    organizations: organizations.map((o) => ({
      id: o.id,
      name: o.name,
      logo: o.logo,
      description: o.description,
      verified: o.verified,
      suspended: o.suspended,
      rejected: o.rejected,
      status: o.rejected ? "rejected" : o.suspended ? "suspended" : o.verified ? "verified" : "pending",
      ownerEmail: o.user.email,
      eventCount: o._count.events,
      createdAt: o.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function getOrganizationAdminDetail(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      user: true,
      events: { include: { applications: true }, orderBy: { createdAt: "desc" } },
      fraudReports: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!org) throw new ApiError(404, "Organization not found");

  const volunteerIds = new Set<string>();
  for (const e of org.events) {
    for (const a of e.applications) volunteerIds.add(a.userId);
  }

  return {
    ...org,
    events: org.events.map((e) => ({
      id: e.id,
      title: e.title,
      moderationStatus: e.moderationStatus.toLowerCase(),
      flagged: e.flagged,
      applications: e.applications.length,
    })),
    volunteerCount: volunteerIds.size,
  };
}

export async function adminOrganizationAction(
  adminId: string,
  organizationId: string,
  action: string,
  data?: { name?: string; description?: string; logo?: string }
) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new ApiError(404, "Organization not found");

  let update: Record<string, unknown> = {};
  switch (action) {
    case "verify":
      update = { verified: true, rejected: false };
      break;
    case "reject":
      update = { rejected: true, verified: false };
      break;
    case "suspend":
      update = { suspended: true };
      break;
    case "unsuspend":
      update = { suspended: false };
      break;
    case "edit":
      update = {
        ...(data?.name && { name: data.name }),
        ...(data?.description !== undefined && { description: data.description }),
        ...(data?.logo && { logo: data.logo }),
      };
      break;
    default:
      throw new ApiError(400, "Invalid action");
  }

  const updated = await prisma.organization.update({ where: { id: organizationId }, data: update });
  await logAdminAction(adminId, `organization.${action}`, "Organization", organizationId, data);
  return updated;
}

export async function listEventsAdmin(params: {
  status?: string;
  flagged?: boolean;
  search?: string;
  page?: number;
}) {
  const page = Math.max(1, params.page ?? 1);
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "all") {
    where.moderationStatus = params.status.toUpperCase() as EventModerationStatus;
  }
  if (params.flagged) where.flagged = true;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { location: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { organization: true, applications: true },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events: events.map((e) => ({
      ...toAppEvent(e),
      moderationStatus: e.moderationStatus.toLowerCase(),
      flagged: e.flagged,
      rejectionReason: e.rejectionReason,
      organizationId: e.organizationId,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function moderateEvent(
  adminId: string,
  eventId: string,
  action: "approve" | "reject" | "flag" | "unflag",
  reason?: string
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, "Event not found");

  const data: Record<string, unknown> = {};
  switch (action) {
    case "approve":
      data.moderationStatus = "APPROVED";
      data.flagged = false;
      data.rejectionReason = null;
      break;
    case "reject":
      data.moderationStatus = "REJECTED";
      data.rejectionReason = reason ?? "Rejected by administrator";
      break;
    case "flag":
      data.flagged = true;
      break;
    case "unflag":
      data.flagged = false;
      break;
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data,
    include: { organization: true, applications: true },
  });

  await logAdminAction(adminId, `event.${action}`, "Event", eventId, { reason });
  return {
    ...toAppEvent(updated),
    moderationStatus: updated.moderationStatus.toLowerCase(),
    flagged: updated.flagged,
    rejectionReason: updated.rejectionReason,
  };
}

export async function listFraudReportsAdmin(params: { status?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "all") {
    where.status = params.status.toUpperCase() as FraudStatus;
  }

  const [reports, total] = await Promise.all([
    prisma.fraudReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        reportedUser: true,
        organization: true,
        event: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.fraudReport.count({ where }),
  ]);

  return {
    reports: reports.map((r) => ({
      id: r.id,
      type: r.type,
      description: r.description,
      severity: r.severity.toLowerCase(),
      status: r.status.toLowerCase(),
      adminNotes: r.adminNotes,
      user: r.reportedUser?.name ?? r.organization?.name ?? "Unknown",
      reportedUserId: r.reportedUserId,
      organizationId: r.organizationId,
      eventId: r.eventId,
      eventTitle: r.event?.title,
      assignedTo: r.assignedTo,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function updateFraudReport(
  adminId: string,
  reportId: string,
  data: { status?: FraudStatus; adminNotes?: string; assignedToId?: string | null }
) {
  const report = await prisma.fraudReport.update({
    where: { id: reportId },
    data: {
      ...(data.status && { status: data.status }),
      ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
    },
    include: { reportedUser: true, organization: true, event: true, assignedTo: true },
  });

  await logAdminAction(adminId, "fraud.update", "FraudReport", reportId, data as Record<string, unknown>);
  return report;
}

export async function listApplicationsAdmin(params: { status?: string; search?: string; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "all") {
    where.status = params.status.toUpperCase() as ApplicationStatus;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: true, event: { include: { organization: true } } },
    }),
    prisma.application.count({ where }),
  ]);

  let filtered = applications;
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = applications.filter(
      (a) =>
        a.user.name.toLowerCase().includes(q) ||
        a.user.email.toLowerCase().includes(q) ||
        a.event.title.toLowerCase().includes(q)
    );
  }

  return {
    applications: filtered.map((a) => ({
      id: a.id,
      volunteer: a.user.name,
      email: a.user.email,
      trust: a.user.trustScore,
      event: a.event.title,
      org: a.event.organization.name,
      status: a.status.toLowerCase(),
      eventId: a.eventId,
      userId: a.userId,
      createdAt: a.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

export async function adminOverrideApplication(adminId: string, applicationId: string, status: ApplicationStatus) {
  const app = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
    include: { user: true, event: true },
  });
  await logAdminAction(adminId, "application.override", "Application", applicationId, { status });
  return app;
}

export async function listAttendanceAdmin(params: { eventId?: string; suspicious?: boolean; page?: number }) {
  const page = Math.max(1, params.page ?? 1);
  const limit = PAGE_SIZE;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.eventId) where.eventId = params.eventId;

  const records = await prisma.attendanceRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      user: true,
      event: { include: { organization: true, attendance: true } },
    },
  });

  const mapped = records.map((r) => {
    const suspicious =
      r.method === "QR" &&
      r.event.attendance &&
      !r.latitude &&
      !r.longitude;
    return {
      id: r.id,
      volunteer: r.user.name,
      email: r.user.email,
      event: r.event.title,
      org: r.event.organization.name,
      method: r.method,
      latitude: r.latitude,
      longitude: r.longitude,
      suspicious,
      createdAt: r.createdAt.toISOString(),
      eventId: r.eventId,
      userId: r.userId,
    };
  });

  const filtered = params.suspicious ? mapped.filter((m) => m.suspicious) : mapped;

  const eventConfigs = await prisma.eventAttendance.findMany({
    include: { event: { include: { organization: true } } },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });

  return {
    records: filtered,
    eventConfigs: eventConfigs.map((c) => ({
      eventId: c.eventId,
      eventTitle: c.event.title,
      org: c.event.organization.name,
      hasGeo: c.geoLatitude != null,
      qrToken: c.qrToken.slice(0, 8) + "…",
    })),
    page,
  };
}

export async function getAdminAnalytics() {
  const now = new Date();
  const days = 14;
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  const [users, events, applications, fraud, attendance] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.event.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.application.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.fraudReport.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
    prisma.attendanceRecord.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
  ]);

  function bucketByDay(items: { createdAt: Date }[]) {
    const buckets: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      buckets[d.toISOString().slice(0, 10)] = 0;
    }
    for (const item of items) {
      const key = item.createdAt.toISOString().slice(0, 10);
      if (buckets[key] !== undefined) buckets[key]++;
    }
    return Object.entries(buckets).map(([date, count]) => ({ date, count }));
  }

  const totals = await getAdminStats();

  return {
    totals,
    series: {
      users: bucketByDay(users),
      events: bucketByDay(events),
      applications: bucketByDay(applications),
      fraud: bucketByDay(fraud),
      attendance: bucketByDay(attendance),
    },
  };
}

export async function getPlatformSettings() {
  return prisma.platformSetting.findMany();
}

export async function updatePlatformSettings(adminId: string, settings: { key: string; value: string }[]) {
  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where: { key: s.key },
      create: { key: s.key, value: s.value },
      update: { value: s.value },
    });
  }
  await logAdminAction(adminId, "settings.update", "PlatformSetting", undefined, { keys: settings.map((s) => s.key) });
  return getPlatformSettings();
}

// Legacy compat
export async function listUsers() {
  return (await listUsersAdmin({})).users;
}

export async function listOrganizations() {
  return prisma.organization.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}

export async function listFraudReports() {
  return (await listFraudReportsAdmin({})).reports;
}

export async function setUserSuspended(userId: string, suspended: boolean) {
  return prisma.user.update({ where: { id: userId }, data: { suspended } });
}

export async function verifyOrganization(organizationId: string) {
  return prisma.organization.update({ where: { id: organizationId }, data: { verified: true } });
}
