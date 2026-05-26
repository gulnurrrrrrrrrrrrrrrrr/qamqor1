import { jsPDF } from "jspdf";

const MARGIN = 50;
const TITLE_SIZE = 14;
const NAME_SIZE = 24;
const SUBTITLE_SIZE = 12;
const BODY_SIZE = 11;
const LINE_HEIGHT = 18;

/**
 * Renders CV into an official certificate PDF.
 */
export function downloadCvPdf(content: string, filename = "certificate.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const maxWidth = pageWidth - MARGIN * 2;

  let y = MARGIN;

  // Watermark logo (low opacity)
  doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(80);
  doc.text("Q", centerX, pageHeight / 2 + 50, { align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Top branding - Website name + logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(TITLE_SIZE);
  doc.setTextColor(51, 51, 51);
  doc.text("Qamqor AI", centerX, y, { align: "center" });
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Social Capital Passport", centerX, y, { align: "center" });
  y += 35;

  // Decorative line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 40;

  // Parse content for sections
  const sections = parseCvContent(content);
  const fullName = sections.fullName || "";
  const experience = sections.experience || [];
  const skills = sections.skills || [];

  // Big name centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(0, 0, 0);
  doc.text(fullName, centerX, y, { align: "center" });
  y += 30;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(SUBTITLE_SIZE);
  doc.setTextColor(100, 100, 100);
  doc.text("Verified Professional Profile", centerX, y, { align: "center" });
  y += 40;

  // Skills (short bullets)
  if (skills.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text("Skills", centerX, y, { align: "center" });
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(80, 80, 80);
    const skillText = skills
      .map(s => s.replace(/•/g, "").trim())
      .filter(s => s)
      .slice(0, 6)
      .join(" • ");
    const lines = doc.splitTextToSize(skillText, maxWidth);
    for (const line of lines) {
      doc.text(line, centerX, y, { align: "center" });
      y += LINE_HEIGHT;
    }
    y += 25;
  }

  // Experience (short bullets)
  if (experience.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text("Experience", centerX, y, { align: "center" });
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    doc.setTextColor(80, 80, 80);
    for (const exp of experience.slice(0, 3)) {
      const cleanExp = exp.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
      if (cleanExp && cleanExp.length < 80) {
        doc.text(`• ${cleanExp}`, centerX, y, { align: "center" });
        y += LINE_HEIGHT;
      }
    }
  }

  // Footer section
  const footerY = pageHeight - MARGIN - 60;

  // Date
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Date: ${today}`, MARGIN, footerY);

  // Signature line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, footerY + 30, MARGIN + 150, footerY + 30);
  doc.setFontSize(9);
  doc.text("Authorized Signature", MARGIN + 75, footerY + 42, { align: "center" });

  // QR Code (bottom right)
  const qrSize = 45;
  const qrX = pageWidth - MARGIN - qrSize;
  const qrY = footerY - 10;
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" });

  doc.save(filename);
}

function parseCvContent(content: string) {
  const sections: { fullName: string; email: string; summary: string[]; experience: string[]; skills: string[]; certifications: string[] } = {
    fullName: "",
    email: "",
    summary: [],
    experience: [],
    skills: [],
    certifications: []
  };
  const lines = content.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("─") || trimmed.startsWith("═")) continue;

    const upper = trimmed.toUpperCase();
    if (upper.includes("FULL NAME")) {
      currentSection = "fullName";
    } else if (upper.includes("PROFESSIONAL SUMMARY")) {
      currentSection = "summary";
    } else if (upper.includes("VOLUNTEER EXPERIENCE")) {
      currentSection = "experience";
    } else if (upper.includes("SKILLS")) {
      currentSection = "skills";
    } else if (upper.includes("CERTIFICATIONS")) {
      currentSection = "certifications";
    } else if (currentSection === "fullName" && !sections.fullName) {
      sections.fullName = trimmed;
    } else if (currentSection === "fullName" && trimmed.toLowerCase().startsWith("email:")) {
      sections.email = trimmed.replace(/email:\s*/i, "");
    } else if (currentSection === "summary") {
      sections.summary.push(trimmed);
    } else if (currentSection === "experience") {
      sections.experience.push(trimmed);
    } else if (currentSection === "skills") {
      sections.skills.push(trimmed);
    } else if (currentSection === "certifications") {
      sections.certifications.push(trimmed);
    }
  }

  return sections;
}
