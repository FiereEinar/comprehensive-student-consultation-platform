import { calendar_v3, google } from 'googleapis';
import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
} from '../constants/env';
import { IConsultation } from '../models/consultation.models';
import { IUser } from '../models/user.model';

export interface CalendarEventDetails {
	summary: string | null;
	description: string | null;
	startTime: string;
	endTime: string;
	attendees?: { email: string }[];
}

export const createCalendarEvent = async (
	auth: any,
	eventDetails: CalendarEventDetails
): Promise<void> => {
	const calendar = google.calendar({ version: 'v3', auth });

	await calendar.events.insert({
		calendarId: 'primary',
		requestBody: {
			summary: eventDetails.summary || 'Consultation Meeting',
			description: eventDetails.description,
			start: { dateTime: eventDetails.startTime, timeZone: 'Asia/Manila' },
			end: { dateTime: eventDetails.endTime, timeZone: 'Asia/Manila' },
			conferenceData: {
				createRequest: {
					requestId: Math.random().toString(36).substring(2, 15),
					conferenceSolutionKey: { type: 'hangoutsMeet' },
				},
			},
			attendees: eventDetails.attendees || [],
		},
		conferenceDataVersion: 1,
	});
};

/**
 * will only create an event on calendar if the status is accepted, will not create an event if the status is declined
 * will delete the event if the status is completed
 */
export const createGoogleCalendarOnStatusUpdate = async (
	consultation: IConsultation,
	calendar: calendar_v3.Calendar,
	student: IUser,
	instructor: IUser,
	status: string,
	withGMeet?: boolean
): Promise<void> => {
	if (status === 'accepted') {
		// Create event if accepted
		const event: any = {
			summary: `Consultation with ${student.name}`,
			description: consultation.description || 'Consultation meeting',
			start: {
				dateTime: consultation.scheduledAt.toISOString(),
				timeZone: 'Asia/Manila',
			},
			end: {
				dateTime: new Date(
					new Date(consultation.scheduledAt).getTime() + 60 * 60 * 1000
				).toISOString(),
				timeZone: 'Asia/Manila',
			},

			attendees: [{ email: instructor.email }, { email: student.email }],
		};

		if (withGMeet) {
			event.conferenceData = {
				createRequest: {
					requestId: Math.random().toString(36).substring(2, 15),
					conferenceSolutionKey: { type: 'hangoutsMeet' },
				},
			};
		}

		const response = await calendar.events.insert({
			calendarId: 'primary',
			requestBody: event,
			conferenceDataVersion: 1,
		});

		const eventId = response.data.id;
		const meetLink = response.data?.conferenceData?.entryPoints?.[0]?.uri;

		if (eventId) consultation.googleCalendarEventId = eventId;
		if (meetLink) consultation.meetLink = meetLink;
		await consultation.save();
	}

	if (status === 'completed' && consultation.googleCalendarEventId) {
		// Remove event if completed
		try {
			await calendar.events.delete({
				calendarId: 'primary',
				eventId: consultation.googleCalendarEventId,
			});
			consultation.googleCalendarEventId = null;
			await consultation.save();
		} catch (error: any) {
			console.log('Error deleting google calendar event', error);
		}
	}
};
