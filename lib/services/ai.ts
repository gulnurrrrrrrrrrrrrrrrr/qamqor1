import { prisma } from "@/lib/prisma";
import { loadVolunteerAiProfile, type VolunteerAiProfile } from "./ai-data";

async function persistGeneration(userId: string, type: string, content: string) {
  try {
    await prisma.aiGeneration.create({ data: { userId, type, content } });
  } catch (err) {
    console.error(`[AI] Could not save ${type} generation (table may be missing)`, err);
  }
}

function skillLevel(value: number): string {
  if (value >= 85) return "Advanced";
  if (value >= 70) return "Proficient";
  if (value >= 50) return "Developing";
  return "Emerging";
}

function deriveAchievements(profile: VolunteerAiProfile): string[] {
  const { stats, timeline, certificates, skills } = profile;
  const achievements: string[] = [];

  if (stats.impactHours >= 100) {
    achievements.push(
      `Completed ${stats.impactHours}+ verified impact hours across ${timeline.length} documented volunteer engagement(s), demonstrating sustained commitment beyond short-term participation.`
    );
  } else if (stats.impactHours > 0) {
    achievements.push(
      `Accumulated ${stats.impactHours} verified impact hours with a growing portfolio of community service documented on the Qamqor platform.`
    );
  }

  if (stats.trustScore >= 80) {
    achievements.push(
      `Maintains an exceptional Trust Score of ${stats.trustScore}/100, reflecting consistent reliability, ethical conduct, and positive references from partner organizations.`
    );
  } else if (stats.trustScore >= 60) {
    achievements.push(
      `Earned a Trust Score of ${stats.trustScore}/100 through verified placements and accountable participation in structured volunteer programs.`
    );
  }

  if (stats.leadershipIndex >= 75) {
    achievements.push(
      `Leadership Index of ${stats.leadershipIndex} indicates strong capacity to coordinate peers, take initiative, and mentor others in collaborative environments.`
    );
  }

  const verifiedCount = timeline.filter((t) => t.verified).length;
  if (verifiedCount > 0) {
    achievements.push(
      `${verifiedCount} organization-verified volunteer role(s) with third-party validation of hours, scope, and contribution quality.`
    );
  }

  if (certificates.length > 0) {
    achievements.push(
      `Holder of ${certificates.length} professional certificate(s) issued by recognized partner organizations, supporting competency in specialized volunteer domains.`
    );
  }

  const topSkills = skills.filter((s) => s.value >= 75).map((s) => s.name);
  if (topSkills.length > 0) {
    achievements.push(
      `Demonstrated excellence in ${topSkills.join(", ")} with quantified skill assessments integrated into the Social Capital Passport.`
    );
  }

  if (stats.admissionsReadiness >= 70) {
    achievements.push(
      `Admissions Readiness rating of ${stats.admissionsReadiness}% positions this candidate competitively for international university applications requiring verified extracurricular impact.`
    );
  }

  if (achievements.length === 0) {
    achievements.push(
      "Actively building a verified volunteer portfolio through the Qamqor platform with a focus on measurable community impact and admissions-ready documentation."
    );
  }

  return achievements;
}

function buildProfessionalSummary(profile: VolunteerAiProfile): string {
  const { name, stats, timeline, skills } = profile;
  const topSkillNames = skills.slice(0, 4).map((s) => s.name);
  const orgList = Array.from(new Set(timeline.map((t) => t.org))).slice(0, 3).join(", ");
  const recent = timeline[0];

  const p1 =
    `${name} is a purpose-driven volunteer and emerging leader with ${stats.impactHours} verified impact hours, ` +
    `a Trust Score of ${stats.trustScore}/100, and an Admissions Readiness index of ${stats.admissionsReadiness}%. ` +
    `Their service record is validated through the Qamqor Social Capital Passport, an integrity-first platform that partners with NGOs and institutions to document real-world contribution.`;

  const p2 = recent
    ? `Most recently, they contributed to ${recent.title} with ${recent.org} (${recent.fullDate}), applying structured teamwork and community engagement in a measurable, outcomes-focused environment. `
    : `They are currently expanding verified placements across curated opportunities that align with academic and professional development goals. `;

  const p3 =
    `Core competencies include ${topSkillNames.length ? topSkillNames.join(", ") : "leadership, communication, and cross-functional collaboration"}, ` +
    `supported by a Leadership Index of ${stats.leadershipIndex}. ` +
    (orgList
      ? `They have collaborated with organizations including ${orgList}, building a credible narrative for university admissions, scholarships, and global service programs.`
      : `They are committed to building organization-backed references and quantified impact narratives suitable for university admissions and scholarship applications.`);

  const p4 =
    `This candidate combines analytical discipline with empathy and cultural adaptability—qualities essential for rigorous academic environments and international cohorts. ` +
    `They seek opportunities where verified service, ethical leadership, and long-term community investment are valued as strongly as academic achievement.`;

  return [p1, p2, p3, p4].join("\n\n");
}

export function buildCvContent(profile: VolunteerAiProfile): string {
  const { name, email, stats, timeline, skills, certificates } = profile;
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const achievements = deriveAchievements(profile);
  const summary = buildProfessionalSummary(profile);

  const metricsBlock = [
    `Trust Score: ${stats.trustScore} / 100`,
    `Verified Impact Hours: ${stats.impactHours}`,
    `Leadership Index: ${stats.leadershipIndex}`,
    `Admissions Readiness: ${stats.admissionsReadiness}%`,
    `Verified Placements: ${timeline.filter((t) => t.verified).length} of ${timeline.length}`,
    `Certifications on Record: ${certificates.length}`,
  ]
    .map((line) => `  • ${line}`)
    .join("\n");

  const experienceBlock =
    timeline.length > 0
      ? timeline
          .map(
            (t, i) =>
              `${i + 1}. ${t.title}\n` +
              `   Organization: ${t.org}\n` +
              `   Period: ${t.fullDate} (${t.date})\n` +
              `   Hours: ${t.hours} | Status: ${t.verified ? "Verified" : "Pending verification"}\n` +
              `   ${t.description}`
          )
          .join("\n\n")
      : "  No timeline entries yet. Apply to verified opportunities on Qamqor to populate this section with organization-backed experience.";

  const skillsBlock =
    skills.length > 0
      ? skills
          .map((s) => `  • ${s.name} — ${s.value}/100 (${skillLevel(s.value)})`)
          .join("\n")
      : "  • Leadership — Developing\n  • Communication — Developing\n  • Teamwork — Developing";

  const certsBlock =
    certificates.length > 0
      ? certificates.map((c) => `  • ${c.name} | Issued by ${c.issuer} | ${c.date}`).join("\n")
      : "  • No certificates recorded yet. Complete verified events to earn credentials from partner organizations.";

  const achievementsBlock = achievements.map((a, i) => `  ${i + 1}. ${a}`).join("\n\n");

  return `══════════════════════════════════════════════════════════════
VOLUNTEER CURRICULUM VITAE
Qamqor Social Capital Passport — Verified Admissions Portfolio
══════════════════════════════════════════════════════════════

FULL NAME
${name}
Email: ${email}

──────────────────────────────────────────────────────────────
PROFESSIONAL SUMMARY
──────────────────────────────────────────────────────────────
${summary}

──────────────────────────────────────────────────────────────
KEY METRICS
──────────────────────────────────────────────────────────────
${metricsBlock}

──────────────────────────────────────────────────────────────
VOLUNTEER EXPERIENCE
──────────────────────────────────────────────────────────────
${experienceBlock}

──────────────────────────────────────────────────────────────
SKILLS
──────────────────────────────────────────────────────────────
${skillsBlock}

──────────────────────────────────────────────────────────────
CERTIFICATIONS
──────────────────────────────────────────────────────────────
${certsBlock}

──────────────────────────────────────────────────────────────
ACHIEVEMENTS & DISTINCTIONS
──────────────────────────────────────────────────────────────
${achievementsBlock}

──────────────────────────────────────────────────────────────
DOCUMENT METADATA
──────────────────────────────────────────────────────────────
Generated by: Qamqor AI Admissions Suite
Verification: Organization-backed data from Social Capital Passport
Generated at: ${timestamp}
`;
}

function buildMotivationLetterContent(profile: VolunteerAiProfile, program: string): string {
  const { name, stats, timeline, skills } = profile;
  const timestamp = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const recentEvents = timeline.slice(0, 3);
  const skillPhrase =
    skills.length > 0
      ? skills
          .slice(0, 5)
          .map((s) => `${s.name} (${skillLevel(s.value).toLowerCase()})`)
          .join(", ")
      : "leadership, intercultural communication, and collaborative problem-solving";

  const intro = `Dear Members of the Admissions Committee,

I am writing to express my sincere interest in ${program}. My name is ${name}, and I submit this letter alongside a verified portfolio of volunteer service documented through the Qamqor Social Capital Passport. Unlike self-reported extracurricular lists, my record reflects organization-validated hours, trust metrics, and structured placements that align with the rigor and integrity your institution expects of competitive applicants.`;

  const experience =
    recentEvents.length > 0
      ? `Over the course of my development as a volunteer leader, I have contributed ${stats.impactHours} verified impact hours across ${timeline.length} documented engagement(s). ` +
        recentEvents
          .map(
            (e, idx) =>
              `${idx === 0 ? "Most recently" : "I also served"}, I worked with ${e.org} on ${e.title} (${e.fullDate}), completing ${e.hours} hours of ${e.verified ? "verified" : "documented"} service. ` +
              `${e.description}`
          )
          .join(" ") +
        ` These experiences required consistent attendance, ethical conduct, and accountability to partner supervisors—standards that mirror the discipline of university-level study.`
      : `I am actively building a verified volunteer portfolio through Qamqor's partner network, prioritizing placements that offer measurable outcomes, supervisor feedback, and documented hours. Although my formal timeline is still expanding, my commitment is to pursue only those opportunities that can be independently validated—reflecting the same transparency I would bring to your academic community.`;

  const impact = `The impact of this work extends beyond hour counts. My Trust Score of ${stats.trustScore}/100 and Leadership Index of ${stats.leadershipIndex} summarize peer and organizational confidence in my reliability, initiative, and ability to contribute under real constraints. ` +
    `With an Admissions Readiness rating of ${stats.admissionsReadiness}%, I have systematically strengthened competencies in ${skillPhrase}. ` +
    `I have learned to listen across cultural and socioeconomic differences, to translate abstract goals into actionable plans, and to measure success by community benefit rather than personal recognition. ` +
    `These lessons shape how I approach group projects, ethical decision-making, and civic responsibility—capacities I hope to deepen through your program's academic and co-curricular environment.`;

  const goals = `Looking ahead, I aim to integrate rigorous scholarship with continued service leadership. I seek a university where interdisciplinary inquiry, global citizenship, and evidence-based impact are central—not peripheral—to the student experience. ` +
    `I intend to contribute to campus life through mentorship, volunteer initiatives, and research that addresses social challenges in Kazakhstan and beyond. ` +
    `Your program represents the next step in a long-term trajectory: from verified community service today to professional and academic leadership tomorrow. I am prepared to engage fully, to uphold your values, and to represent your community with integrity.`;

  const closing = `Thank you for considering my application. I welcome the opportunity to discuss how my verified service record, personal character, and academic ambitions align with ${program}. I am confident that I would enrich your cohort while growing as a scholar and as a citizen committed to the public good.

Respectfully submitted,

${name}
${timestamp}

—
Generated with Qamqor AI Admissions Suite (template-based; no external AI APIs). Data sourced from verified Social Capital Passport records.`;

  return [intro, experience, impact, goals, closing].join("\n\n");
}

export async function generateCv(userId: string) {
  const profile = await loadVolunteerAiProfile(userId);
  const content = buildCvContent(profile);
  await persistGeneration(userId, "CV", content);
  return { content, text: content };
}

export async function generateMotivationLetter(userId: string, program = "a leading international university program") {
  const profile = await loadVolunteerAiProfile(userId);
  const content = buildMotivationLetterContent(profile, program);
  await persistGeneration(userId, "MOTIVATION", content);
  return { content, text: content };
}
