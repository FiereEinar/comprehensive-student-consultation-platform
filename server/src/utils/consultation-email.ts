import { EMAIL_USER } from '../constants/env';
import { IConsultation } from '../models/consultation.models';
import { IUser } from '../models/user.model';
import { sendMail } from './email';

export interface EmailRecipient {
	name: string;
	email: string;
}

export interface ConsultationEmailData {
	student: IUser;
	instructor: IUser;
	summary?: string;
	startTime: string;
	endTime: string;
	meetLink: string;
}

export const sendConsultationEmail = async (
	recipient: EmailRecipient,
	meetingData: ConsultationEmailData
): Promise<void> => {
	const { student, instructor, summary, startTime, endTime, meetLink } =
		meetingData;

	const message = {
		from: `"Consultation Admin" <${EMAIL_USER}>`,
		to: recipient.email,
		subject: 'Consultation Meeting Scheduled',
		html: `
      <div style="font-family:sans-serif;padding:1rem;border-radius:8px;background:#f9fafb;">
        <h2 style="color:#111;">Consultation Meeting Scheduled</h2>
        <p>Hello ${recipient.name || ''},</p>
        <p>
          A consultation meeting has been scheduled between <b>${
						student.name
					}</b> 
          and <b>${instructor.name}</b>.
        </p>
        <p><b>Summary:</b> ${summary || 'Consultation Meeting'}</p>
        <p><b>Start:</b> ${new Date(startTime).toLocaleString('en-PH', {
					timeZone: 'Asia/Manila',
				})}</p>
        <p><b>End:</b> ${new Date(endTime).toLocaleString('en-PH', {
					timeZone: 'Asia/Manila',
				})}</p>
        <a href="${meetLink}" style="display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#111;color:#fff;border-radius:6px;text-decoration:none;">
          Join Google Meet
        </a>
        <p style="margin-top:1rem;font-size:12px;color:#555;">Please join on time. Meeting link is unique for this consultation.</p>
      </div>
    `,
	};

	await sendMail(message);
};

export const sendConsultationStatusUpdateEmail = async (
	consultation: IConsultation,
	student: IUser,
	instructor: IUser,
	status: string
): Promise<void> => {
	const message = {
		from: `"Consultation Admin" <${EMAIL_USER}>`,
		to: student.email,
		subject: `Consultation ${
			status === 'accepted'
				? 'Accepted'
				: status === 'declined'
				? 'Declined'
				: status === 'completed'
				? 'Completed'
				: 'Updated'
		}`,
		html: `
        <div style="font-family:sans-serif;padding:1rem;border-radius:8px;background:#f9fafb;">
          <h2 style="color:#111;">Consultation Status Update</h2>
          <p>Hello ${student.name},</p>
          <p>Your consultation with <b>${
						instructor.name
					}</b> has been <b>${status}</b>.</p>
          ${
						status === 'accepted' && consultation.meetLink
							? `<p>You can join using this link:</p>
               <a href="${consultation.meetLink}" 
                  style="display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#111;color:#fff;border-radius:6px;text-decoration:none;">
                  Join Google Meet
               </a>`
							: ''
					}
          <p style="margin-top:1rem;font-size:12px;color:#555;">
            This is an automated notification from the Consultation System.
          </p>
        </div>
      `,
	};

	await sendMail(message);
};

interface PendingConsultationEmailParams {
	instructorEmail: string;
	instructorName: string;
	studentName: string;
	scheduledAt: Date;
}

export async function sendPendingConsultationEmail({
	instructorEmail,
	instructorName,
	studentName,
	scheduledAt,
}: PendingConsultationEmailParams) {
	const formattedDate = scheduledAt.toLocaleString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

	const mailOptions = {
		from: `"Consultation System" <${EMAIL_USER}>`,
		to: instructorEmail,
		subject: `New Consultation Request from ${studentName}`,
		html: `
      <h2>Hello ${instructorName},</h2>
      <p>You have received a new consultation request.</p>

      <p><strong>Student:</strong> ${studentName}</p>
      <p><strong>Scheduled At:</strong> ${formattedDate}</p>

      <p>Please log in to your dashboard to accept or decline this request.</p>

      <p>— Consultation Management System</p>
    `,
	};

	await sendMail(mailOptions);
}
