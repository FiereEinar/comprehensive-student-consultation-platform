import { z } from 'zod';

export const createSubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	code: z.string().min(1, 'Subject code is required'),
	description: z.string().optional(),
	schoolYear: z.string().min(1, 'School year is required'),
	semester: z.number().int().min(1).max(2),
});

export const updateSubjectSchema = createSubjectSchema.partial().extend({
	instructors: z.array(z.string()).optional(),
});
