import z from 'zod';

export const createConsultationSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required').max(100),
	scheduledAt: z.string().min(1, 'Schedule is required'),
	instructor: z.string().min(1, 'Instructor is required'),
	purpose: z.string().min(1, 'Purpose is required'),
	sectonCode: z.string().min(1, 'Section code is required'),
	subjectCode: z.string().min(1, 'Subject code is required'),
});
