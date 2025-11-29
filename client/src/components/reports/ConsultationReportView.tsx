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
  instructorName: string;
  periodLabel: string;   // e.g. "August–December 2025"
  semesterLabel: string; // e.g. "1st" or "2nd"
  consultations: ConsultationRow[];
  acceptedConsultations: ConsultationRow[];
  pendingConsultations: ConsultationRow[];
  declinedConsultations: ConsultationRow[];
  completedConsultations: ConsultationRow[];
  totalAccepted: number;
  totalPending: number;
  totalDeclined: number;
  totalCompleted: number;
  totalFinished: number;
  reportSignature: string;
};

// convert name to Title Case (e.g. "robert james nahial" -> "Robert James Nahial")
const toTitleCase = (value: string) =>
  value
    ? value
        .toLowerCase()
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : value;

export const ConsultationReportView = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      instructorName,
      periodLabel,
      semesterLabel,
      acceptedConsultations,
      pendingConsultations,
      declinedConsultations,
      completedConsultations,
      totalAccepted,
      totalPending,
      totalDeclined,
      totalCompleted,
      totalFinished,
      reportSignature,
    },
    ref,
  ) => {
    console.log('ConsultationReportView props:', {
      instructorName,
      periodLabel,
      semesterLabel,
      totalAccepted,
      totalPending,
      totalDeclined,
      totalCompleted,
      totalFinished,
      acceptedLen: acceptedConsultations?.length,
      pendingLen: pendingConsultations?.length,
      declinedLen: declinedConsultations?.length,
      completedLen: completedConsultations?.length,
    });

    const renderStatusTable = (
      consultations: ConsultationRow[] | undefined,
      statusLabel: string,
    ) => (
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 10,
          marginBottom: 20,
        }}
      >
        <thead>
          <tr>
            {['#', 'Title', 'Purpose', 'Subject', 'Section', 'Status', 'Date'].map(
              (header) => (
                <th
                  key={header}
                  style={{
                    backgroundColor:
                      statusLabel === 'Accepted' || statusLabel === 'Completed'
                        ? 'rgb(34, 197, 94)'
                        : 'rgb(239, 68, 68)',
                    color: 'white',
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 10,
                  }}
                >
                  {header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {!consultations || consultations.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  textAlign: 'center',
                  padding: 12,
                  border: '1px solid rgb(6, 28, 51)',
                  color: '#999',
                  fontSize: 10,
                }}
              >
                No {statusLabel.toLowerCase()} consultations.
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
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 10,
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: 10,
                  }}
                >
                  {c.title}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px 8px',
                    textAlign: 'left',
                    fontSize: 10,
                  }}
                >
                  {c.purpose}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 10,
                  }}
                >
                  {c.subjectCode}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 10,
                  }}
                >
                  {c.sectonCode}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 'bold',
                    color:
                      statusLabel === 'Accepted' || statusLabel === 'Completed'
                        ? 'rgb(34, 197, 94)'
                        : 'rgb(239, 68, 68)',
                  }}
                >
                  {statusLabel}
                </td>
                <td
                  style={{
                    border: '1px solid rgb(6, 28, 51)',
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 10,
                  }}
                >
                  {c.scheduledAt}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );

    const displayName = toTitleCase(instructorName);

    return (
      <div
        ref={ref}
        style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 12,
          color: '#000000',
          padding: '24px',
          backgroundColor: '#ffffff',
          width: '794px',
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
          {/* name in title case + Semester # from semesterLabel */}
          <h4>
            {displayName} – Semester # {semesterLabel}
          </h4>
        </div>

        {/* ACCEPTED */}
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              borderBottom: '3px solid rgb(6, 28, 51)',
              marginBottom: 10,
              paddingBottom: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 'bold',
                fontSize: 13,
                color: 'rgb(6, 28, 51)',
              }}
            >
              Accepted ({totalAccepted})
            </p>
          </div>
          {renderStatusTable(acceptedConsultations, 'Accepted')}
        </div>

        {/* PENDING */}
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              borderBottom: '3px solid rgb(6, 28, 51)',
              marginBottom: 10,
              paddingBottom: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 'bold',
                fontSize: 13,
                color: 'rgb(6, 28, 51)',
              }}
            >
              Pending ({totalPending})
            </p>
          </div>
          {renderStatusTable(pendingConsultations, 'Pending')}
        </div>

        {/* DECLINED */}
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              borderBottom: '3px solid rgb(6, 28, 51)',
              marginBottom: 10,
              paddingBottom: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 'bold',
                fontSize: 13,
                color: 'rgb(6, 28, 51)',
              }}
            >
              Declined ({totalDeclined})
            </p>
          </div>
          {renderStatusTable(declinedConsultations, 'Declined')}
        </div>

        {/* COMPLETED */}
        <div style={{ marginTop: 30 }}>
          <div
            style={{
              borderBottom: '3px solid rgb(6, 28, 51)',
              marginBottom: 10,
              paddingBottom: 2,
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 'bold',
                fontSize: 13,
                color: 'rgb(6, 28, 51)',
              }}
            >
              Completed ({totalCompleted})
            </p>
          </div>
          {renderStatusTable(completedConsultations, 'Completed')}
        </div>

        {/* SUMMARY */}
        <div
          style={{
            borderBottom: '5px solid rgb(6, 28, 51)',
            marginTop: 40,
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
            Summary
          </p>
        </div>
        <div
          style={{
            marginLeft: 20,
            fontSize: 12,
            color: 'rgb(6, 28, 51)',
            lineHeight: 1.8,
          }}
        >
          <p>
            <strong>Instructor:</strong> {displayName}
          </p>
          <p>
            <strong>Period:</strong> {periodLabel}
          </p>
          <p>
            <strong>Semester:</strong> Semester # {semesterLabel}
          </p>
          <p>
            <strong>Total Accepted:</strong> {totalAccepted}
          </p>
          <p>
            <strong>Total Pending:</strong> {totalPending}
          </p>
          <p>
            <strong>Total Declined:</strong> {totalDeclined}
          </p>
          <p>
            <strong>Total Completed:</strong> {totalCompleted}
          </p>
          <p>
            <strong>Total Finished:</strong> {totalFinished}
          </p>
          <p>
            <strong>Report Generated:</strong>{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* SIGNATURE */}
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
              {displayName}
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
