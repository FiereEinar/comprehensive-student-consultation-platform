export enum AppErrorCodes {
	InvalidAccessToken = 'InvalidAccessToken',
	InvalidGoogleCalendarTokens = 'InvalidGoogleCalendarTokens',
}

export const DEFAULT_LIMIT = 10;
export const HASH_ENCODING = 'hex';
export const HASH_ALGORITHM = 'sha256';

export const RESOURCE_TYPES = {
	USER: 'User',
	CONSULTATION: 'Consultation',
	BACKUP: 'Backup',
	SUBJECT: 'Subject',
	SECTION: 'Section',
	ROLE: 'Role',
	PERMISSION: 'Permission',
	CONSULTATION_PURPOSE: 'ConsultationPurpose',
};

export const WHITELISTED_DOMAINS = ['student.buksu.edu.ph'];

export const SUPER_ADMIN = 'Super Admin';

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

export const DEFAULT_CONSULTATION_PURPOSES = [
	'Academic Advising',
	'Thesis Consultation',
	'Grade Consultation',
	'Capstone Consultation',
	'Other Concerns',
];
