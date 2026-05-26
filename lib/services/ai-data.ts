import { prisma } from "@/lib/prisma";

export type VolunteerAiProfile = {
  name: string;
  email: string;
  stats: {
    trustScore: number;
    leadershipIndex: number;
    impactHours: number;
    admissionsReadiness: number;
  };
  timeline: {
    title: string;
    org: string;
    date: string;
    fullDate: string;
    hours: number;
    verified: boolean;
    description: string;
  }[];
  skills: { name: string; value: number }[];
  certificates: { name: string; issuer: string; date: string }[];
};

export async function loadVolunteerAiProfile(userId: string): Promise<VolunteerAiProfile> {
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
    name: user.name,
    email: user.email,
    stats: {
      trustScore: user.trustScore,
      leadershipIndex: user.leadershipIndex,
      impactHours: user.impactHours,
      admissionsReadiness: user.admissionsReadiness,
    },
    timeline: user.timeline.map((t) => {
      const fullDate = t.entryDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const date = t.entryDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const verification = t.verified ? "organization-verified" : "pending verification";
      const description =
        `Served as a volunteer for "${t.title}" with ${t.orgName}, contributing ${t.hours} documented impact hours (${verification}). ` +
        `Responsibilities included community engagement, collaborative problem-solving, and delivering measurable outcomes aligned with the organization's mission. ` +
        `This placement strengthened cross-cultural communication, accountability, and project execution in a real-world setting.`;

      return {
        title: t.title,
        org: t.orgName,
        date,
        fullDate,
        hours: t.hours,
        verified: t.verified,
        description,
      };
    }),
    skills,
    certificates: user.certificates.map((c) => ({
      name: c.name,
      issuer: c.issuer,
      date: c.issuedAt.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    })),
  };
}
