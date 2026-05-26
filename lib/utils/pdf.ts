import { jsPDF } from "jspdf";

const MARGIN = 50;

export function downloadCvPdf(content: string, filename = "certificate.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const maxWidth = pageWidth - MARGIN * 2 - 40;

  // ── Gold double border ──────────────────────────────────────────────────────
  const bm = 20;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(3);
  doc.rect(bm, bm, pageWidth - bm * 2, pageHeight - bm * 2);
  doc.setLineWidth(0.8);
  doc.rect(bm + 6, bm + 6, pageWidth - (bm + 6) * 2, pageHeight - (bm + 6) * 2);

  // ── Watermark "Q" ──────────────────────────────────────────────────────────
  doc.setGState(new (doc as any).GState({ opacity: 0.04 }));
  doc.setFont("times", "bold");
  doc.setFontSize(200);
  doc.setTextColor(212, 175, 55);
  doc.text("Q", centerX, pageHeight / 2 + 70, { align: "center" });
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // ── Parse content ──────────────────────────────────────────────────────────
  const sections = parseCvContent(content);
  const fullName  = sections.fullName  || "";
  const skills    = sections.skills    || [];
  const experience = sections.experience || [];

  // ── Layout: fixed Y positions, no dynamic centering ───────────────────────
  // Everything is placed with known Y values. Footer is anchored to bottom.
  const TOP = bm + 30;

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 60);
  doc.text("CERTIFICATE OF VERIFICATION", centerX, TOP, { align: "center" });

  // Decorative line under title
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(centerX - 120, TOP + 8, centerX + 120, TOP + 8);

  // Name
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(10, 10, 10);
  doc.text(fullName, centerX, TOP + 42, { align: "center" });

  // Subtitle
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(
    "This certifies that the above-named individual has demonstrated verified professional competency",
    centerX, TOP + 65, { align: "center", maxWidth }
  );
  doc.text(
    "through the Qamqor Social Capital Passport.",
    centerX, TOP + 78, { align: "center" }
  );

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.line(centerX - 180, TOP + 90, centerX + 180, TOP + 90);

  // ── Verified Skills ────────────────────────────────────────────────────────
  let y = TOP + 110;

  if (skills.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("Verified Skills", centerX, y, { align: "center" });
    y += 14;

    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    const skillText = skills
      .map(s => s.replace(/•/g, "").trim())
      .filter(Boolean)
      .slice(0, 6)
      .join("  •  ");
    const skillLines = doc.splitTextToSize(skillText, maxWidth);
    for (const line of skillLines) {
      doc.text(line, centerX, y, { align: "center" });
      y += 13;
    }
    y += 10;
  }

  // ── Key Experience ─────────────────────────────────────────────────────────
  const validExp = experience
    .slice(0, 6)
    .map(e => e.replace(/^\d+\.\s*/, "").replace(/•/g, "").trim())
    .filter(e => e && e.length < 100);

  if (validExp.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("Key Experience", centerX, y, { align: "center" });
    y += 14;

    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    for (const exp of validExp) {
      doc.text(`• ${exp}`, centerX, y, { align: "center" });
      y += 13;
    }
  }

  // ── Footer — anchored to bottom ────────────────────────────────────────────
  const footerY = pageHeight - bm - 65;

  // Signature (left side)
  const sigX = MARGIN + 20;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(sigX, footerY + 8, sigX + 130, footerY + 8);
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Authorized Signature", sigX + 65, footerY + 20, { align: "center" });

  // Certificate ID + Date (center)
  const certId = "QCP-" + Date.now().toString().slice(-8);
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Certificate ID: ${certId}`, centerX, footerY, { align: "center" });
  doc.text(`Date: ${today}`, centerX, footerY + 14, { align: "center" });

  // QR box (right side)
  const qrSize = 44;
  const qrX = pageWidth - MARGIN - qrSize - 20;
  const qrY = footerY - 14;
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 10, { align: "center" });

  doc.save(filename);
}

function parseCvContent(content: string) {
  const sections = {
    fullName: "", email: "",
    summary: [] as string[], experience: [] as string[],
    skills: [] as string[], certifications: [] as string[],
  };
  const lines = content.split("\n");
  let currentSection = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("─") || trimmed.startsWith("═")) continue;
    const upper = trimmed.toUpperCase();

    if (upper.includes("FULL NAME"))              currentSection = "fullName";
    else if (upper.includes("PROFESSIONAL SUMMARY")) currentSection = "summary";
    else if (upper.includes("VOLUNTEER EXPERIENCE")) currentSection = "experience";
    else if (upper.includes("SKILLS"))            currentSection = "skills";
    else if (upper.includes("CERTIFICATIONS"))    currentSection = "certifications";
    else if (currentSection === "fullName" && !sections.fullName)
      sections.fullName = trimmed;
    else if (currentSection === "fullName" && trimmed.toLowerCase().startsWith("email:"))
      sections.email = trimmed.replace(/email:\s*/i, "");
    else if (currentSection === "summary")        sections.summary.push(trimmed);
    else if (currentSection === "experience")     sections.experience.push(trimmed);
    else if (currentSection === "skills")         sections.skills.push(trimmed);
    else if (currentSection === "certifications") sections.certifications.push(trimmed);
  }
  return sections;
}