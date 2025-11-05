import type { User } from './user';

export type Subject = {
	_id: string;
	name: string;
	code: string;
	description?: string;
	instructor: User;
	createdAt: Date;
	updatedAt: Date;
};

export type Section = {
	_id: string;
	name: string;
	schedule: string;
	subject: Subject;
	students: string[];
	createdAt: Date;
	updatedAt: Date;
};
