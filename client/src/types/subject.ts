import type { User } from './user';

export type Subject = {
	_id: string;
	name: string;
	code: string;
	description?: string;
	schoolYear: string;
	semester: number;
	instructors: User[];
	createdAt: Date;
	updatedAt: Date;
};
