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
	semesterLabel: string;
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

	// ===========================
	// HEADER
	// ===========================
	doc.setFont(...FONT_BOLD);
	doc.setFontSize(16);
	doc.setTextColor(6, 28, 51);
	doc.text('Instructor Consultation Report', pageWidth / 2, 15, {
		align: 'center',
	});

	doc.setFont(...FONT_NORMAL);
	doc.setFontSize(11);
	doc.setTextColor(0, 0, 0);
	doc.text(
		`${instructorName} – Semester # ${semesterLabel}`,
		pageWidth / 2,
		22,
		{
			align: 'center',
		}
	);

	// ===========================
	// MERGED TABLE
	// ===========================
	const mergedRows: ConsultationRow[] = [
		...buckets.accepted,
		...buckets.pending,
		...buckets.declined,
		...buckets.completed,
	];

	const body = mergedRows.length
		? mergedRows.map((c, i) => [
				String(i + 1),
				c.title || '',
				c.purpose || '',
				c.subjectCode || '',
				c.sectonCode || '',
				c.status || '',
				c.scheduledAt || '',
		  ])
		: [['—', 'No records', '', '', '', '', '']];

	doc.setFont(...FONT_BOLD);
	doc.setFontSize(10);
	doc.setTextColor(6, 28, 51);
	doc.text(`Consultation Records (${mergedRows.length})`, margin, 32);

	autoTable(doc, {
		startY: 36,
		head: [['#', 'Title', 'Purpose', 'Subject', 'Section', 'Status', 'Date']],
		body,
		theme: 'grid',
		styles: {
			font: FONT_FAMILY,
			fontSize: 8,
			cellPadding: 3,
			textColor: [0, 0, 0],
			lineColor: [200, 200, 200], // consistent
			lineWidth: 0.3,
		},
		headStyles: {
			font: FONT_FAMILY,
			fillColor: [255, 255, 255],
			textColor: [0, 0, 0],
			fontStyle: 'bold',
			lineColor: [200, 200, 200],
			lineWidth: 0.3,
		},
		columnStyles: {
			0: { cellWidth: 8, halign: 'center' },
		},
		margin: { bottom: footerHeight + 40 },
	});

	const tableEndY = (doc as any).lastAutoTable.finalY;

	// ===========================
	// SUMMARY
	// ===========================
	const summaryY = Math.min(tableEndY + 12, footerStartY - 80);

	doc.setFont(...FONT_BOLD);
	doc.setFontSize(10);
	doc.setTextColor(6, 28, 51);
	doc.text('Summary', margin, summaryY);

	doc.setFont(...FONT_NORMAL);
	doc.setFontSize(9);

	const summary = [
		`Instructor: ${instructorName}`,
		`Period: ${periodLabel}`,
		`Semester: Semester # ${semesterLabel}`,
		`Accepted: ${buckets.accepted.length}`,
		`Pending: ${buckets.pending.length}`,
		`Declined: ${buckets.declined.length}`,
		`Completed: ${buckets.completed.length}`,
		`Finished (Accepted + Completed): ${
			buckets.accepted.length + buckets.completed.length
		}`,
		`Report Generated: ${new Date().toLocaleDateString()}`,
	];

	let sy = summaryY + 6;
	summary.forEach((txt) => {
		doc.text(txt, margin + 3, sy);
		sy += 4;
	});

	// ===========================
	// SIGNATURE BLOCK (ALIGNED)
	// ===========================

	const signatureY = footerStartY - 38;

	// Left block (Dean)
	const leftX = margin;

	// Right block (Instructor)
	const rightX = pageWidth - margin - 45;

	// ----- SIGNED BY (Right) -----
	doc.setFont(...FONT_BOLD);
	doc.setFontSize(9);
	doc.setTextColor(6, 28, 51);
	doc.text('Signed By:', rightX, signatureY);

	doc.setFont(...FONT_NORMAL);
	doc.setFontSize(9);
	const instLineY = signatureY + 8;
	doc.line(rightX, instLineY, rightX + 40, instLineY);
	doc.text(instructorName.toUpperCase(), rightX, instLineY + 3);
	doc.setFontSize(8);
	doc.setTextColor(100, 100, 100);
	doc.text('Instructor', rightX, instLineY + 6);

	// ----- APPROVED BY (Left, aligned perfectly) -----
	doc.setFont(...FONT_BOLD);
	doc.setFontSize(9);
	doc.setTextColor(6, 28, 51);
	doc.text('Approved By:', leftX, signatureY);

	doc.setFont(...FONT_NORMAL);
	doc.setFontSize(9);
	doc.setTextColor(0, 0, 0);

	const deanLineY = signatureY + 8;
	doc.line(leftX, deanLineY, leftX + 40, deanLineY);
	doc.text('DR. MARILOU O. ESPINA', leftX, deanLineY + 3);
	doc.setFontSize(8);
	doc.setTextColor(100, 100, 100);
	doc.text('Dean of College of Technologies', leftX, deanLineY + 6);

	// ===========================
	// FOOTER
	// ===========================
	const pageCount = (doc as any).internal.pages.length - 1;

	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);

		doc.setDrawColor(150, 150, 150);
		doc.setLineWidth(0.3);
		doc.line(margin, footerStartY - 2, pageWidth - margin, footerStartY - 2);

		doc.setFont(...FONT_NORMAL);
		doc.setFontSize(8);
		doc.setTextColor(100, 100, 100);

		doc.text(`Report ID: ${reportSignature}`, margin, footerStartY + 4);

		doc.text(
			`Page ${i} of ${pageCount}`,
			pageWidth - margin,
			footerStartY + 4,
			{
				align: 'right',
			}
		);
	}

	doc.save(`consultation-report-${Date.now()}.pdf`);
}
