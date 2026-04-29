import { z } from 'zod';

export const createSubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	code: z
		.string()
		.min(1, 'Subject code is required')
		.max(10, 'Max 10 characters'),
	description: z.string().optional(),
	schoolYear: z.string().min(1, 'School year is required'),
	semester: z.string().min(1, 'Semester is required'),
});
