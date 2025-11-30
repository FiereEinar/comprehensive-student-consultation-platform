import z from 'zod';

export const createConsultationSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required').max(100),
	scheduledAt: z.string().min(1, 'Schedule is required'),
	student: z.string().optional(),
	instructor: z.string().optional(),
	purpose: z.string().min(1, 'Purpose is required'),
	sectonCode: z.string().optional(),
	subjectCode: z.string().optional(),
});

export const consutationStatusSchema = z.enum(
	['pending', 'accepted', 'declined', 'completed'],
	'Status is required'
);

export const updateConsultationSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required').max(100),
	scheduledAt: z.string().min(1, 'Schedule is required'),
	student: z.string().optional(),
	instructor: z.string().optional(),
	purpose: z.string().min(1, 'Purpose is required'),
	sectonCode: z.string().optional(),
	subjectCode: z.string().optional(),
	status: consutationStatusSchema,
});
