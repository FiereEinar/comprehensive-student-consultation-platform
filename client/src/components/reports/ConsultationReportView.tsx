// File: client/src/components/reports/ConsultationReportView.tsx

import React from 'react';

/**
 * One consultation row shown in the PDF table
 */
export type ConsultationRow = {
  _id: string;
  title: string;
  purpose: string;
  subjectCode: string;
  sectonCode: string; // matches your DB field name
  status: string;
  scheduledAt: string; // formatted date string
};

type Props = {
  instructorName: string;   // e.g. "Juan Dela Cruz"
  periodLabel: string;      // e.g. "August–December 2025"
  consultations: ConsultationRow[];
  totalFinished: number;
  reportSignature: string;  // e.g. "CSCP1128202580000"
};

/**
 * This component is the HTML layout that react-to-pdf will convert to a PDF.
 */
export const ConsultationReportView = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      instructorName,
      periodLabel,
      consultations,
      totalFinished,
      reportSignature,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
          fontSize: 12,
          color: '#333',
          padding: '20px',
          backgroundColor: '#fff',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2
            style={{
              margin: 0,
              color: 'rgb(6, 28, 51)',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            Instructor Consultation Report
          </h2>
          <h4
            style={{
              margin: '10px 0',
              fontWeight: 'normal',
              fontSize: 13,
              color: '#000',
            }}
          >
            {instructorName} – {periodLabel}
          </h4>
        </div>

        {/* FINISHED CONSULTATIONS SECTION */}
        <div
          style={{
            borderBottom: '5px solid rgb(6, 28, 51)',
            marginTop: 30,
            marginBottom: 15,
            paddingBottom: 3,
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: 14,
              color: 'rgb(6, 28, 51)',
            }}
          >
            Finished Consultations
          </p>
        </div>
        <p style={{ marginBottom: 15 }}>
          This section lists all finished consultations for the selected
          instructor and period.
        </p>

        {/* TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 11,
            marginTop: 10,
          }}
        >
          <thead>
            <tr>
              {[
                '#',
                'Title',
                'Purpose',
                'Subject Code',
                'Section Code',
                'Status',
                'Scheduled At',
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    backgroundColor: 'rgb(3, 0, 99)',
                    color: 'white',
                    border: '1px solid rgb(6, 28, 51)',
                    padding: 8,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {consultations.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    padding: 15,
                    border: '1px solid rgb(6, 28, 51)',
                    color: '#999',
                  }}
                >
                  No finished consultations found.
                </td>
              </tr>
            ) : (
              consultations.map((c, index) => (
                <tr
                  key={c._id}
                  style={{
                    backgroundColor: index % 2 === 1 ? '#f8f9fa' : 'white',
                  }}
                >
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    {index + 1}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'left',
                    }}
                  >
                    {c.title}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'left',
                    }}
                  >
                    {c.purpose}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    {c.subjectCode}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    {c.sectonCode}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    {c.status}
                  </td>
                  <td
                    style={{
                      border: '1px solid rgb(6, 28, 51)',
                      padding: 8,
                      textAlign: 'center',
                    }}
                  >
                    {c.scheduledAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* GENERAL REPORT SECTION */}
        <div
          style={{
            borderBottom: '5px solid rgb(6, 28, 51)',
            marginTop: 30,
            marginBottom: 15,
            paddingBottom: 3,
          }}
        >
          <p
            style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: 14,
              color: 'rgb(6, 28, 51)',
            }}
          >
            General Report
          </p>
        </div>
        <p style={{ marginBottom: 15 }}>
          This section summarizes finished consultations for this instructor in
          the selected period.
        </p>

        <div
          style={{
            marginLeft: 20,
            fontSize: 12,
            color: 'rgb(6, 28, 51)',
            lineHeight: 1.8,
          }}
        >
          <p>
            <strong>Instructor:</strong> {instructorName}
          </p>
          <p>
            <strong>Period:</strong> {periodLabel}
          </p>
          <p>
            <strong>Total Finished Consultations:</strong> {totalFinished}
          </p>
          <p>
            <strong>Report Generated:</strong>{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* SIGNATURE SECTION */}
        <div
          style={{
            marginTop: 50,
            paddingTop: 20,
            borderTop: '2px solid rgb(6, 28, 51)',
          }}
        >
          <div style={{ textAlign: 'right', fontSize: 11 }}>
            <p style={{ margin: '5px 0', fontStyle: 'italic' }}>
              Approved by:
            </p>
            <p
              style={{
                margin: '20px 0',
                fontSize: 13,
                fontWeight: 'bold',
                color: 'rgb(6, 28, 51)',
              }}
            >
              {instructorName}
            </p>
            <p style={{ margin: '10px 0', fontSize: 10, color: '#666' }}>
              Report ID: <strong>{reportSignature}</strong>
            </p>
            <p style={{ margin: '5px 0', fontSize: 10, color: '#999' }}>
              Generated: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

ConsultationReportView.displayName = 'ConsultationReportView';
