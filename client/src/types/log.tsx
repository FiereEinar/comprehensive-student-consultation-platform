import type { User } from './user';

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
