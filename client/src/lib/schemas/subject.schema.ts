import { z } from 'zod';

export const createSubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	code: z
		.string()
		.min(1, 'Subject code is required')
		.max(10, 'Max 10 characters'),
	description: z.string().optional(),
});

export const createSectionSchema = z.object({
	name: z.string().min(1, 'Section name is required'),
	schedule: z.string().optional(),
	students: z.string().optional(),
});
