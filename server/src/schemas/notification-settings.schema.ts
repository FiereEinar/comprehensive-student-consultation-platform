import { z } from 'zod';

export const createNotificationSettingsSchema = z.object({
	user: z.string().min(1, 'User is required'),
	email: z.object({
		newConsultation: z.boolean(),
		statusUpdates: z.boolean(),
		reminders: z.boolean(),
		systemAnnouncements: z.boolean(),
	}),
	inApp: z.object({
		newConsultation: z.boolean(),
		statusUpdates: z.boolean(),
		reminders: z.boolean(),
	}),
	quietHours: z.object({
		enabled: z.boolean(),
		start: z.string(),
		end: z.string(),
	}),
});
