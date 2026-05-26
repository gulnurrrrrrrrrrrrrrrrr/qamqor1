import { jsPDF } from "jspdf";

const MARGIN = 40;
const TITLE_SIZE = 16;
const SECTION_SIZE = 13;
const BODY_SIZE = 11;
const LINE_HEIGHT = 16;

/**
 * Renders CV into a clean 1-page PDF with professional layout.
 */
export function downloadCvPdf(content: string, filename = "cv.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const maxWidth = pageWidth - MARGIN * 2;

  let y = MARGIN;

  // Title - Centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(TITLE_SIZE);
  doc.text("Certificate of Professional Profile", centerX, y, { align: "center" });
  y += 30;

  // Parse content for sections
  const sections = parseCvContent(content);
  const fullName = sections.fullName || "";
  const email = sections.email || "";
  const summary = sections.summary || [];
  const experience = sections.experience || [];
  const skills = sections.skills || [];
  const certifications = sections.certifications || [];

  // Name + Email - Centered
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(fullName, centerX, y, { align: "center" });
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(email, centerX, y, { align: "center" });
  y += 25;

  // Summary (2-3 lines max)
  if (summary.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_SIZE);
    doc.text("Summary", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    const summaryText = summary.join(" ").substring(0, 200);
    const lines = doc.splitTextToSize(summaryText, maxWidth);
    for (const line of lines.slice(0, 3)) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 10;
  }

  // Experience (bullets only)
  if (experience.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_SIZE);
    doc.text("Experience", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    for (const exp of experience.slice(0, 4)) {
      const cleanExp = exp.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
      if (cleanExp && cleanExp.length < 100) {
        doc.text(`• ${cleanExp}`, MARGIN, y);
        y += LINE_HEIGHT;
      }
    }
    y += 10;
  }

  // Skills
  if (skills.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_SIZE);
    doc.text("Skills", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    const skillText = skills
      .map(s => s.replace(/•/g, "").trim())
      .filter(s => s)
      .slice(0, 8)
      .join(" • ");
    const lines = doc.splitTextToSize(skillText, maxWidth);
    for (const line of lines) {
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }
    y += 10;
  }

  // Certifications
  if (certifications.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(SECTION_SIZE);
    doc.text("Certifications", MARGIN, y);
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(BODY_SIZE);
    for (const cert of certifications.slice(0, 4)) {
      const cleanCert = cert.replace(/•/g, "").trim();
      if (cleanCert && cleanCert.length < 80) {
        doc.text(`• ${cleanCert}`, MARGIN, y);
        y += LINE_HEIGHT;
      }
    }
  }

  // QR Code placeholder (bottom right)
  const qrSize = 50;
  const qrX = pageWidth - MARGIN - qrSize;
  const qrY = pageHeight - MARGIN - qrSize;
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setFontSize(8);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 12, { align: "center" });

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
