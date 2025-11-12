import { google } from 'googleapis';

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
