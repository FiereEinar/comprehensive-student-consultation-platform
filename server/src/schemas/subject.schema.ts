import { z } from 'zod';

export const createSubjectSchema = z.object({
	name: z.string().min(1, 'Subject name is required'),
	code: z.string().min(1, 'Subject code is required'),
	description: z.string().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createSectionSchema = z.object({
	name: z.string().min(1, 'Section name is required'),
	schedule: z.string().optional(),
	subject: z.string().min(1, 'Subject ID is required'),
	students: z.array(z.string()).optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
