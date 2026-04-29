import z from 'zod';

export const createConsultationSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().max(100).optional(),
	scheduledAt: z.string().min(1, 'Schedule is required'),
	student: z.string().min(1, 'Student is required'),
	instructor: z.string().min(1, 'Instructor is required'),
	purpose: z.string().min(1, 'Purpose is required'),
	subjectCode: z.string().optional(),
	schoolYear: z.string().optional(),
	semester: z.number().int().min(1).max(2).optional(),
});

export const consutationStatusSchema = z.enum(
	['pending', 'accepted', 'declined', 'completed'],
	'Status is required'
);

export const updateConsultationSchema = z.object({
	title: z.string().min(1, 'Title is required').max(100),
	description: z.string().max(500).optional(),
	scheduledAt: z.string().min(1, 'Schedule is required'),
	purpose: z.string().min(1, 'Purpose is required'),
	subjectCode: z.string().optional(),
	schoolYear: z.string().optional(),
	semester: z.number().int().min(1).max(2).optional(),
	status: consutationStatusSchema,
});
