import type { User } from './user';

export type LOG_RESOURCES = 'All' | 'User' | 'Consultation';
// | 'Subject'
// | 'Section';

export const RESOURCE_TYPES: Record<string, LOG_RESOURCES> = {
	ALL: 'All',
	USER: 'User',
	CONSULTATION: 'Consultation',
	// SUBJECT: 'Subject',
	// SECTION: 'Section',
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
