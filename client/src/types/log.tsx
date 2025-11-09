import type { User } from './user';

export const RESOURCE_TYPES = {
	ALL: 'All',
	USER: 'User',
	CONSULTATION: 'Consultation',
	SUBJECT: 'Subject',
	SECTION: 'Section',
};

export type ActivityLog = {
	_id: string;
	user?: User;
	action: string;
	description?: string;
	resourceType?: string;
	ipAddress?: string;
	status: 'success' | 'failure';
	timestamp: string;
};
