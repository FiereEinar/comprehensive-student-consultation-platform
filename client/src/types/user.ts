export type UserTypes = 'admin' | 'student' | 'instructor';

export type User = {
	_id: string;
	name: string;
	institutionalID: string;
	email: string;
	password: string;
	role: UserTypes;
};
