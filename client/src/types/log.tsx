import type { User } from './user';

export type LOG_RESOURCES = 'All' | 'User' | 'Consultation' | 'Backup';
// | 'Subject'
// | 'Section';

export const RESOURCE_TYPES: Record<string, LOG_RESOURCES> = {
	ALL: 'All',
	USER: 'User',
	CONSULTATION: 'Consultation',
	BACKUP: 'Backup',
	// SUBJECT: 'Subject',
	// SECTION: 'Section',
};

export type ActivityLog = {
	_id: string;
	user?: User;
	action: string; // "USER_LOGIN", "UPDATE_PASSWORD", "DELETE_SUBJECT"
	description?: string; // "User John Doe updated their password"
	url?: string;
	resourceType?: string;
	resourceId?: string;
	ipAddress?: string;
	userAgent?: string;
	status: 'success' | 'failure';
	timestamp: Date;
};
