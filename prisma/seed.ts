import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("password123", 12);

  await prisma.platformSetting.createMany({
    data: [
      { key: "QR Verification", value: "Enabled" },
      { key: "Geo Verification", value: "Enabled" },
      { key: "Trust Score Threshold", value: "50" },
      { key: "Auto Fraud Detection", value: "Active" },
    ],
    skipDuplicates: true,
  });

  const volunteer = await prisma.user.upsert({
    where: { email: "aida@qamqor.kz" },
    update: {},
    create: {
      email: "aida@qamqor.kz",
      passwordHash,
      name: "Aida Karimova",
      role: "VOLUNTEER",
      trustScore: 87,
      leadershipIndex: 72,
      impactHours: 156,
      admissionsReadiness: 78,
      skills: [
        { name: "Leadership", value: 85 },
        { name: "Communication", value: 92 },
        { name: "Teaching", value: 70 },
        { name: "Empathy", value: 88 },
        { name: "Tech", value: 65 },
        { name: "Languages", value: 78 },
      ],
    },
  });

  const orgUser = await prisma.user.upsert({
    where: { email: "org@greenfuture.kz" },
    update: {},
    create: {
      email: "org@greenfuture.kz",
      passwordHash,
      name: "Green Future KZ",
      role: "ORGANIZATION",
      organization: {
        create: {
          name: "Green Future KZ",
          logo: "GF",
          description: "Environmental NGO focused on climate action and youth engagement across Kazakhstan.",
          verified: true,
        },
      },
    },
    include: { organization: true },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@qamqor.kz" },
    update: {},
    create: {
      email: "admin@qamqor.kz",
      passwordHash,
      name: "Platform Admin",
      role: "ADMIN",
    },
  });

  const org = orgUser.organization!;
  const orgs = [
    { name: "Open Doors NGO", logo: "OD" },
    { name: "EduBridge", logo: "EB" },
    { name: "Care Alliance", logo: "CA" },
    { name: "Silver Connect", logo: "SC" },
    { name: "Civic Voice", logo: "CV" },
  ];

  const extraOrgs = [];
  for (const o of orgs) {
    const u = await prisma.user.upsert({
      where: { email: `${o.logo.toLowerCase()}@org.qamqor.kz` },
      update: {},
      create: {
        email: `${o.logo.toLowerCase()}@org.qamqor.kz`,
        passwordHash,
        name: o.name,
        role: "ORGANIZATION",
        organization: { create: { name: o.name, logo: o.logo, verified: true } },
      },
      include: { organization: true },
    });
    extraOrgs.push(u.organization!);
  }

  const allOrgs = [org, ...extraOrgs];
  const eventDefs = [
    { orgIdx: 0, title: "Climate Action Summit Support", location: "Almaty", mode: "OFFLINE", verification: "HYBRID", trust: 65, date: "2026-06-12", hours: 16, max: 60, featured: true, skills: ["Leadership", "Communication"] },
    { orgIdx: 1, title: "Refugee Integration Mentorship", location: "Remote", mode: "ONLINE", verification: "QR", trust: 70, date: "2026-06-18", hours: 12, max: 40, featured: false, skills: ["Mentoring", "Languages"] },
    { orgIdx: 2, title: "STEM Workshop for Rural Schools", location: "Shymkent", mode: "HYBRID", verification: "GEO", trust: 60, date: "2026-06-22", hours: 20, max: 25, featured: true, skills: ["Teaching", "STEM"] },
    { orgIdx: 3, title: "Hospital Patient Companion Program", location: "Astana", mode: "OFFLINE", verification: "HYBRID", trust: 75, date: "2026-07-02", hours: 24, max: 50, featured: false, skills: ["Empathy", "Healthcare"] },
    { orgIdx: 4, title: "Digital Literacy for Seniors", location: "Remote", mode: "ONLINE", verification: "QR", trust: 55, date: "2026-07-08", hours: 10, max: 30, featured: false, skills: ["Patience", "Tech"] },
    { orgIdx: 5, title: "Youth Policy Forum Facilitation", location: "Almaty", mode: "OFFLINE", verification: "GEO", trust: 80, date: "2026-07-15", hours: 18, max: 20, featured: false, skills: ["Facilitation", "Policy"] },
  ];

  const events = [];
  for (const e of eventDefs) {
    const created = await prisma.event.create({
      data: {
        organizationId: allOrgs[e.orgIdx].id,
        title: e.title,
        location: e.location,
        mode: e.mode as "ONLINE" | "OFFLINE" | "HYBRID",
        verification: e.verification as "QR" | "GEO" | "HYBRID",
        trustRequired: e.trust,
        eventDate: new Date(e.date),
        hours: e.hours,
        maxParticipants: e.max,
        featured: e.featured,
        skills: e.skills,
      },
    });
    events.push(created);
  }

  await prisma.timelineEntry.createMany({
    data: [
      { userId: volunteer.id, eventId: events[0].id, title: "Climate Action Summit", orgName: "Green Future KZ", entryDate: new Date("2026-05-01"), hours: 16 },
      { userId: volunteer.id, eventId: events[2].id, title: "STEM Workshop Series", orgName: "EduBridge", entryDate: new Date("2026-04-01"), hours: 20 },
      { userId: volunteer.id, title: "Refugee Mentorship Program", orgName: "Open Doors NGO", entryDate: new Date("2026-03-01"), hours: 12 },
    ],
  });

  await prisma.certificate.createMany({
    data: [
      { userId: volunteer.id, name: "Verified Volunteer — Climate Action", issuer: "Green Future KZ", issuedAt: new Date("2026-05-01") },
      { userId: volunteer.id, name: "Leadership Excellence", issuer: "Qamqor AI", issuedAt: new Date("2026-04-01") },
    ],
  });

  await prisma.application.createMany({
    data: [
      { userId: volunteer.id, eventId: events[0].id, status: "REVIEWING" },
      { userId: volunteer.id, eventId: events[2].id, status: "ACCEPTED" },
      { userId: volunteer.id, eventId: events[5].id, status: "PENDING" },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      { userId: volunteer.id, title: "Application under review", body: "Green Future KZ is reviewing your Climate Action application." },
      { userId: volunteer.id, title: "Accepted — STEM Workshop", body: "Check in with QR code on event day." },
      { userId: volunteer.id, title: "Trust Score updated", body: "Your score increased to 87 after verified hours." },
    ],
  });

  const pipelineUsers = await Promise.all(
    ["Aida K.", "Daniyar M.", "Sofia L.", "Arman T."].map((name, i) =>
      prisma.user.create({
        data: {
          email: `volunteer${i + 1}@demo.qamqor.kz`,
          passwordHash,
          name,
          role: "VOLUNTEER",
          trustScore: [91, 78, 85, 62][i],
        },
      })
    )
  );

  for (let i = 0; i < pipelineUsers.length; i++) {
    await prisma.application.create({
      data: {
        userId: pipelineUsers[i].id,
        eventId: events[0].id,
        status: (["APPROVED", "SCREENING", "PENDING", "FLAGGED"] as const)[i],
      },
    });
  }

  await prisma.fraudReport.createMany({
    data: [
      { type: "Fake attendance", description: "Duplicate check-in", severity: "HIGH", reportedUserId: pipelineUsers[3].id },
      { type: "Duplicate QR scan", description: "Org anomaly", severity: "MEDIUM", organizationId: org.id },
    ],
  });

  console.log("Seed complete. Demo accounts (password: password123):");
  console.log("  Volunteer:", volunteer.email);
  console.log("  Organization:", orgUser.email);
  console.log("  Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
