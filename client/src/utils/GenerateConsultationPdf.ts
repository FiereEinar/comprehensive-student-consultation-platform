import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ConsultationRow } from '@/components/reports/ConsultationReportView';

const FONT_FAMILY = 'helvetica';
const FONT_NORMAL: [string, 'normal'] = [FONT_FAMILY, 'normal'];
const FONT_BOLD: [string, 'bold'] = [FONT_FAMILY, 'bold'];

export type StatusBuckets = {
  accepted: ConsultationRow[];
  pending: ConsultationRow[];
  declined: ConsultationRow[];
  completed: ConsultationRow[];
};

export function generateConsultationPdf(opts: {
  instructorName: string;
  periodLabel: string;
  semesterLabel: string; // NEW: e.g. "1st" or "2nd"
  buckets: StatusBuckets;
  reportSignature: string;
}) {
  const {
    instructorName,
    periodLabel,
    semesterLabel,
    buckets,
    reportSignature,
  } = opts;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const footerHeight = 20;
  const footerStartY = pageHeight - footerHeight;

  // ===== ADD HEADER =====
  doc.setFont(...FONT_BOLD);
  doc.setFontSize(16);
  doc.setTextColor(6, 28, 51);
  doc.text('Instructor Consultation Report', pageWidth / 2, 15, {
    align: 'center',
  });

  doc.setFont(...FONT_NORMAL);
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  // CHANGED: show Semester instead of date range
  const headerLine = `${instructorName} – Semester # ${semesterLabel}`;
  doc.text(headerLine as string, pageWidth / 2, 22, {
    align: 'center',
  });

  // ===== HELPER: Add a status table (minimal, bold headers only) =====
  const addStatusTable = (
    title: string,
    rows: ConsultationRow[] | undefined,
    startY: number,
  ) => {
    const sectionTitle = `${title} (${rows?.length ?? 0})`;
    doc.setFont(...FONT_BOLD);
    doc.setFontSize(10);
    doc.setTextColor(6, 28, 51);
    doc.text(sectionTitle as string, margin, startY);

    const body =
      rows && rows.length
        ? rows.map((c, idx) => [
            String(idx + 1),
            c.title || '',
            c.purpose || '',
            c.subjectCode || '',
            c.sectonCode || '',
            c.status || '',
            c.scheduledAt || '',
          ])
        : [['—', 'No records', '', '', '', '', '']];

    autoTable(doc, {
      startY: startY + 4,
      head: [
        ['#', 'Title', 'Purpose', 'Subject', 'Section', 'Status', 'Date'],
      ],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
        font: FONT_FAMILY,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [150, 150, 150],
        lineWidth: 0.5,
        font: FONT_FAMILY,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
      },
      theme: 'grid',
      margin: { bottom: footerHeight + 20 }, // Increased margin to prevent overlap
    });

    return (doc as any).lastAutoTable.finalY;
  };

  // ===== BUILD THE TABLES =====
  let y = 32;
  y = addStatusTable('Accepted', buckets.accepted, y);
  y = addStatusTable('Pending', buckets.pending, y + 6);
  y = addStatusTable('Declined', buckets.declined, y + 6);
  y = addStatusTable('Completed', buckets.completed, y + 6);

  // ===== ADD SUMMARY SECTION =====
  const summaryY = Math.min(y + 10, footerStartY - 80); // Increased gap to 80

  doc.setFont(...FONT_BOLD);
  doc.setFontSize(10);
  doc.setTextColor(6, 28, 51);
  doc.text('Summary', margin, summaryY);
  doc.setFont(...FONT_NORMAL);

  doc.setFontSize(9);

  const totalAccepted = buckets.accepted.length;
  const totalPending = buckets.pending.length;
  const totalDeclined = buckets.declined.length;
  const totalCompleted = buckets.completed.length;
  const totalFinished = totalAccepted + totalCompleted;

  const summaryLines = [
    `Instructor: ${instructorName}`,
    `Period: ${periodLabel}`,
    `Semester: Semester # ${semesterLabel}`, // NEW line to show semester in summary
    `Total Accepted: ${totalAccepted}`,
    `Total Pending: ${totalPending}`,
    `Total Declined: ${totalDeclined}`,
    `Total Completed: ${totalCompleted}`,
    `Total Finished: ${totalFinished}`,
    `Report Generated: ${new Date().toLocaleDateString()}`,
  ];

  let sy = summaryY + 6;
  summaryLines.forEach((line) => {
    const text = line as string;
    doc.text(text, margin + 3, sy);
    sy += 4;
  });

  // ===== ADD SIGNATURE BLOCK (Higher up with more space) =====
  const signatureStartY = footerStartY - 50;

  // Right-side X coordinate for instructor block
  const rightX = pageWidth - margin - 40;

  // "Signed By:" aligned with instructor block
  doc.setFont(...FONT_BOLD);
  doc.setFontSize(9);
  doc.setTextColor(6, 28, 51);
  doc.text('Signed By:', rightX, signatureStartY);

  // Instructor signature area (RIGHT SIDE)
  doc.setFont(...FONT_NORMAL);
  doc.setFontSize(9);
  const instructorSignY = signatureStartY + 8;
  doc.line(rightX, instructorSignY, rightX + 35, instructorSignY);
  const instructorNameUpper = instructorName.toUpperCase();
  doc.text(instructorNameUpper as string, rightX, instructorSignY + 3);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Instructor', rightX, instructorSignY + 6);

  // Dean signature area (BOTTOM LEFT) with "Approved by"
  doc.setFont(...FONT_BOLD);
  doc.setFontSize(9);
  doc.setTextColor(6, 28, 51);
  const deanLabelY = instructorSignY + 15; // Increased gap from 12 to 15
  doc.text('Approved by:', margin, deanLabelY);

  doc.setFont(...FONT_NORMAL);
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const deanSignY = deanLabelY + 8;
  doc.line(margin, deanSignY, margin + 35, deanSignY);
  doc.text('DR. MARILOU O. ESPINA', margin, deanSignY + 3);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Dean of College of Technologies', margin, deanSignY + 6);

  // ===== ADD FOOTER TO EVERY PAGE =====
  const pageCount = (doc as any).internal.pages.length - 1;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(margin, footerStartY - 2, pageWidth - margin, footerStartY - 2);

    doc.setFont(...FONT_NORMAL);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    const reportIdText = `Report ID: ${reportSignature}`;
    doc.text(reportIdText as string, margin, footerStartY + 4);

    const pageText = `Page ${i} of ${pageCount}`;
    doc.text(pageText as string, pageWidth - margin, footerStartY + 4, {
      align: 'right',
    });
  }

  // ===== SAVE =====
  doc.save(`consultation-report-${Date.now()}.pdf`);
}
