import type { Role } from '@/api/role';
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
	adminRole?: Role; // For advanced RBAC
	archived?: boolean;
	profilePicture?: string;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date | undefined;
	googleID: string;
	googleCalendarTokens: any;
	createdAt: Date;
	updatedAt: Date;
};

export type InstructorAvailability = z.infer<typeof createAvilabilitySchema> & {
	_id: string;
	user: string;
};

export type Invitation = {
	_id: string;
	email: string;
	name: string;
	role: 'instructor';
	token: string;
	expiresAt: Date;
	status: 'pending' | 'accepted' | 'expired';
	createdAt: Date;
	updatedAt: Date;
};
