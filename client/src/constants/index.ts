export const QUERY_KEYS = {
	CONSULTATIONS: 'consultations',
	INSTRUCTORS: 'instructors',
	STUDENTS: 'students',
	USERS: 'users',
	INSTRUCTORS_AVAILABILITIES: 'instructors-availabilities',
	ADMIN_DASHBOARD: 'admin-dashboard',
	INVITATIONS: 'invitations',
	SUBJECTS: 'subjects',
	SECTIONS: 'sections',
	LOGS: 'logs',
	TODAYS_OVERVIEW: 'today-overview',
	STATUS_BREAKDOWN: 'status-breakdown',
	NOTIFICATIONS: 'notifications',
	NOTIFICATION_SETTINGS: 'notification-settings',
	GOOGLE_CALENDAR_CONNECTION: 'google-calendar-connection',
	USERS_STATS: 'users-stats',
	ROLES: 'roles',
};

export const MODULES = {
	// User actions
	CREATE_USER: 'user:create',
	READ_USER: 'user:read',
	UPDATE_USER: 'user:update',
	ARCHIVE_USER: 'user:archive',
	// GET_USER_STATS: 'user:stats',
	INVITE_INSTRUCTOR_USER: 'user:invite-instructor',

	// Consultation actions
	CREATE_CONSULTATION: 'consultation:create',
	READ_CONSULTATION: 'consultation:read',
	UPDATE_CONSULTATION: 'consultation:update',
	DELETE_CONSULTATION: 'consultation:delete',
	UPDATE_CONSULTATION_STATUS: 'consultation:status',
	UPDATE_CONSULTATION_NOTES: 'consultation:notes',
	CREATE_CONSULTATION_MEETING: 'consultation:meeting',
	GET_CONSULTATION_REPORT: 'consultation:report',

	// Log actions
	READ_LOG: 'log:read',

	// Backup actions
	CREATE_BACKUP: 'backup:create',
	READ_BACKUP: 'backup:read',
	DOWNLOAD_BACKUP: 'backup:download',
	RESTORE_BACKUP: 'backup:restore',
	DELETE_BACKUP: 'backup:delete',

	// Role actions
	CREATE_ROLE: 'role:create',
	READ_ROLE: 'role:read',
	UPDATE_ROLE: 'role:update',
	DELETE_ROLE: 'role:delete',
	ASSIGN_ROLE: 'role:assign',
};

export type Modules = (typeof MODULES)[keyof typeof MODULES];
