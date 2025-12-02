import { google } from 'googleapis';

export interface MeetEventDetails {
	summary?: string;
	description?: string;
	startTime: string;
	endTime: string;
}

export const createGoogleMeetLink = async (
	auth: any,
	eventDetails: MeetEventDetails
): Promise<string | undefined | null> => {
	const calendar = google.calendar({ version: 'v3', auth });

	const event = {
		summary: eventDetails.summary || 'Consultation Meeting',
		description:
			eventDetails.description || 'Consultation meeting via Google Meet',
		start: { dateTime: eventDetails.startTime, timeZone: 'Asia/Manila' },
		end: { dateTime: eventDetails.endTime, timeZone: 'Asia/Manila' },
		conferenceData: {
			createRequest: {
				requestId: Math.random().toString(36).substring(2, 15),
				conferenceSolutionKey: { type: 'hangoutsMeet' },
			},
		},
	};

	const response = await calendar.events.insert({
		calendarId: 'primary',
		requestBody: event,
		conferenceDataVersion: 1,
	});

	return response.data?.conferenceData?.entryPoints?.[0]?.uri;
};
