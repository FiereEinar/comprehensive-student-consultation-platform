import z from 'zod';

export const AVAILABLE_DAYS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];

export const createAvilabilitySchema = z
	.object({
		day: z.enum(AVAILABLE_DAYS, 'Day is required'),
		startTime: z.string().min(1, 'Start time is required'),
		endTime: z.string().min(1, 'End time is required'),
		slots: z.string().min(1, 'Slots is required'),
	})
	.refine(
		(data) => {
			const startTime = new Date(`1970-01-01T${data.startTime}`);
			const endTime = new Date(`1970-01-01T${data.endTime}`);
			return startTime < endTime;
		},
		{
			message: 'Start time must be before end time',
			path: ['endTime'],
		}
	)
	.refine(
		(date) => {
			const slotsInt = parseInt(date.slots);
			return slotsInt > 0;
		},
		{
			message: 'Slots must be greater than 0',
			path: ['slots'],
		}
	);
