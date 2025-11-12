import { EMAIL_USER } from '../constants/env';
import { sendMail } from './email';

export interface EmailRecipient {
	name: string;
	email: string;
}

export interface ConsultationEmailData {
	student: { name: string };
	instructor: { name: string };
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
