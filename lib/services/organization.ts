import { prisma } from "@/lib/prisma";

export async function getOrgAnalytics(organizationId: string) {
  const [events, applications, org] = await Promise.all([
    prisma.event.findMany({ where: { organizationId }, include: { applications: true } }),
    prisma.application.count({ where: { event: { organizationId } } }),
    prisma.organization.findUnique({ where: { id: organizationId } }),
  ]);

  const verifiedHours = events.reduce((sum, e) => {
    const accepted = e.applications.filter((a) => a.status === "ACCEPTED" || a.status === "APPROVED").length;
    return sum + accepted * e.hours;
  }, 0);

  const volunteers = await prisma.application.findMany({
    where: { event: { organizationId }, status: { in: ["ACCEPTED", "APPROVED"] } },
    distinct: ["userId"],
  });

  const avgTrust =
    volunteers.length > 0
      ? (
          await prisma.user.aggregate({
            where: {
              id: { in: volunteers.map((v) => v.userId) },
            },
            _avg: { trustScore: true },
          })
        )._avg.trustScore ?? 0
      : 0;

  const fraudAlerts = await prisma.fraudReport.count({
    where: { organizationId, status: "OPEN" },
  });

  return {
    totalEvents: events.length,
    activeVolunteers: volunteers.length,
    verifiedHours,
    avgTrust: Math.round(avgTrust),
    fraudAlerts,
    org,
    eventPerformance: events.slice(0, 3).map((e) => {
      const accepted = e.applications.filter((a) => a.status === "ACCEPTED" || a.status === "APPROVED").length;
      const fill = e.maxParticipants > 0 ? Math.round((accepted / e.maxParticipants) * 100) : 0;
      return { name: e.title, fill, hours: accepted * e.hours };
    }),
  };
}

export async function updateOrganization(
  organizationId: string,
  data: { name?: string; description?: string; logo?: string }
) {
  return prisma.organization.update({ where: { id: organizationId }, data });
}
