import { prisma } from "@/lib/prisma";

export async function getVolunteerDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      certificates: { orderBy: { issuedAt: "desc" } },
      timeline: { orderBy: { entryDate: "desc" } },
    },
  });
  if (!user) throw new Error("User not found");

  const skills = (user.skills as { name: string; value: number }[]) ?? [];

  return {
    stats: {
      trustScore: user.trustScore,
      leadershipIndex: user.leadershipIndex,
      impactHours: user.impactHours,
      admissionsReadiness: user.admissionsReadiness,
    },
    timeline: user.timeline.map((t) => ({
      id: t.id,
      title: t.title,
      org: t.orgName,
      date: t.entryDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      hours: t.hours,
      verified: t.verified,
    })),
    skills,
    certificates: user.certificates.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      date: c.issuedAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    })),
  };
}

export async function updateVolunteerProfile(
  userId: string,
  data: { name?: string; skills?: { name: string; value: number }[] }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.skills && { skills: data.skills }),
    },
  });
}
