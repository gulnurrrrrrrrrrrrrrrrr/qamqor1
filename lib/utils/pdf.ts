import { jsPDF } from "jspdf";

const MARGIN = 50;
const TITLE_SIZE = 18;
const NAME_SIZE = 28;
const SUBTITLE_SIZE = 11;
const BODY_SIZE = 10;
const LINE_HEIGHT = 16;

/**
 * Renders CV into a premium certificate PDF.
 */
export function downloadCvPdf(content: string, filename = "certificate.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const maxWidth = pageWidth - MARGIN * 2;

  // Gold border
  const borderMargin = 25;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(2);
  doc.rect(borderMargin, borderMargin, pageWidth - borderMargin * 2, pageHeight - borderMargin * 2);
  doc.setLineWidth(0.5);
  doc.rect(borderMargin + 5, borderMargin + 5, pageWidth - (borderMargin + 5) * 2, pageHeight - (borderMargin + 5) * 2);

  // Watermark logo (low opacity)
  doc.setGState(new (doc as any).GState({ opacity: 0.03 }));
  doc.setFont("times", "bold");
  doc.setFontSize(120);
  doc.setTextColor(212, 175, 55);
  doc.text("Q", centerX, pageHeight / 2 + 60, { align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Parse content for sections
  const sections = parseCvContent(content);
  const fullName = sections.fullName || "";
  const experience = sections.experience || [];
  const skills = sections.skills || [];

  // Calculate content height
  let contentHeight = 35 + 25 + LINE_HEIGHT * 2 + 35; // Title + name + subtitle + spacing
  if (skills.length > 0) {
    contentHeight += LINE_HEIGHT + 20; // Skills header + spacing
    const skillText = skills
      .map(s => s.replace(/•/g, "").trim())
      .filter(s => s)
      .slice(0, 6)
      .join(" • ");
    const skillLines = doc.splitTextToSize(skillText, maxWidth);
    contentHeight += skillLines.length * LINE_HEIGHT;
  }
  if (experience.length > 0) {
    contentHeight += LINE_HEIGHT; // Experience header
    contentHeight += Math.min(experience.slice(0, 3).filter(e => {
      const clean = e.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim();
      return clean && clean.length < 80;
    }).length, 3) * LINE_HEIGHT;
  }

  // Calculate vertical centering
  const headerHeight = MARGIN;
  const footerHeight = 70;
  const availableHeight = pageHeight - headerHeight - footerHeight - MARGIN * 2;
  const startY = headerHeight + (availableHeight - contentHeight) / 2;

  let y = startY;

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(TITLE_SIZE);
  doc.setTextColor(51, 51, 51);
  doc.text("CERTIFICATE OF VERIFICATION", centerX, y, { align: "center" });
  y += 35;

  // Big name centered
  doc.setFont("times", "bold");
  doc.setFontSize(NAME_SIZE);
  doc.setTextColor(0, 0, 0);
  doc.text(fullName, centerX, y, { align: "center" });
  y += 25;

  // Subtitle
  doc.setFont("times", "normal");
  doc.setFontSize(SUBTITLE_SIZE);
  doc.setTextColor(80, 80, 80);
  doc.text("This certifies that the above-named individual has demonstrated verified", centerX, y, { align: "center" });
  y += LINE_HEIGHT;
  doc.text("professional competency through the Qamqor Social Capital Passport.", centerX, y, { align: "center" });
  y += 35;

  // Skills (short bullets)
  if (skills.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text("Verified Skills", centerX, y, { align: "center" });
    y += LINE_HEIGHT;
    doc.setFont("times", "normal");
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
    y += 20;
  }

  // Experience (short bullets)
  if (experience.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.text("Key Experience", centerX, y, { align: "center" });
    y += LINE_HEIGHT;
    doc.setFont("times", "normal");
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
  const footerY = pageHeight - MARGIN - 70;

  // Certificate ID
  const certId = "QCP-" + Date.now().toString().slice(-8);
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(`Certificate ID: ${certId}`, MARGIN, footerY);

  // Date
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  doc.text(`Date: ${today}`, MARGIN, footerY + 20);

  // Signature line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(MARGIN, footerY + 55, MARGIN + 160, footerY + 55);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Authorized Signature", MARGIN + 80, footerY + 68, { align: "center" });

  // QR Code (bottom right)
  const qrSize = 50;
  const qrX = pageWidth - MARGIN - qrSize;
  const qrY = footerY - 5;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
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
