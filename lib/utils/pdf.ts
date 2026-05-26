import { jsPDF } from "jspdf";

const MARGIN = 48;
const TITLE_SIZE = 18;
const BODY_SIZE = 10;
const LINE_HEIGHT = 14;

/**
 * Renders CV text into a multi-page PDF and triggers download as cv.pdf.
 */
export function downloadCvPdf(content: string, filename = "cv.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - MARGIN * 2;

  let y = MARGIN;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(TITLE_SIZE);
  doc.text("Volunteer CV", MARGIN, y);
  y += 28;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, pageWidth - MARGIN, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(BODY_SIZE);

  const paragraphs = content.split(/\n\n+/);

  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);

    for (const line of lines) {
      if (y > pageHeight - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    }

    y += LINE_HEIGHT * 0.75;
  }

  doc.save(filename);
}
