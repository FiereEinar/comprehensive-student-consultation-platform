import type { createAvilabilitySchema } from '@/lib/schemas/availability.schema';
import type z from 'zod';

export type UserTypes = 'admin' | 'student' | 'instructor';

export type User = {
	_id: string;
	name: string;
	institutionalID: string;
	email: string;
	password: string;
	role: UserTypes;
	createdAt: Date;
	updatedAt: Date;
};

export type InstructorAvailability = z.infer<typeof createAvilabilitySchema> & {
	_id: string;
	user: string;
};
