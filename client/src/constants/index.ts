import type { UserTypes } from '@/types/user';
import {
	Calendar,
	ClipboardClock,
	Clock4,
	DatabaseBackup,
	GraduationCap,
	LayoutDashboard,
	ReceiptPoundSterling,
	Shield,
	Users,
	type LucideProps,
} from 'lucide-react';

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
	LOCAL_BACKUPS: 'local-backups',
	CLOUD_BACKUPS: 'cloud-backups',
};

export const MODULES = {
	// User actions
	READ_USER: 'user:read',
	CREATE_USER: 'user:create',
	UPDATE_USER: 'user:update',
	ARCHIVE_USER: 'user:archive',
	// GET_USER_STATS: 'user:stats',
	INVITE_INSTRUCTOR_USER: 'user:invite-instructor',

	// Consultation actions
	READ_CONSULTATION: 'consultation:read',
	CREATE_CONSULTATION: 'consultation:create',
	UPDATE_CONSULTATION: 'consultation:update',
	DELETE_CONSULTATION: 'consultation:delete',
	CREATE_CONSULTATION_MEETING: 'consultation:meeting',
	UPDATE_CONSULTATION_STATUS: 'consultation:status',
	UPDATE_CONSULTATION_NOTES: 'consultation:notes',
	GET_CONSULTATION_REPORT: 'consultation:report',

	// Log actions
	READ_LOG: 'log:read',

	// Backup actions
	READ_BACKUP: 'backup:read',
	CREATE_BACKUP: 'backup:create',
	DOWNLOAD_BACKUP: 'backup:download',
	RESTORE_BACKUP: 'backup:restore',
	DELETE_BACKUP: 'backup:delete',

	// Role actions
	READ_ROLE: 'role:read',
	CREATE_ROLE: 'role:create',
	UPDATE_ROLE: 'role:update',
	DELETE_ROLE: 'role:delete',
	ASSIGN_ROLE: 'role:assign',
};

export type Modules = (typeof MODULES)[keyof typeof MODULES];

export type SidebarNavLinkType = {
	title: string;
	url: string;
	icon: React.ForwardRefExoticComponent<
		Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
	>;
	permissions?: Modules[];
	roles?: UserTypes[];
};

export const instructorSidebarLinks: SidebarNavLinkType[] = [
	{
		title: 'Dashboard',
		url: '/instructor/dashboard',
		icon: LayoutDashboard,
		roles: ['instructor'],
	},
	{
		title: 'Consultations',
		url: '/instructor/consultation',
		icon: Calendar,
		roles: ['instructor'],
	},
	{
		title: 'Availability',
		url: '/instructor/availability',
		icon: Clock4,
		roles: ['instructor'],
	},
];

export const studentSidebarLinks: SidebarNavLinkType[] = [
	{
		title: 'Dashboard',
		url: '/student/dashboard',
		icon: LayoutDashboard,
		roles: ['student'],
	},
	{
		title: 'Consultations',
		url: '/student/consultation',
		icon: Calendar,
		roles: ['student'],
	},
];

export const adminSidebarLinks: SidebarNavLinkType[] = [
	{
		title: 'Dashboard',
		url: '/admin/dashboard',
		icon: LayoutDashboard,
		roles: ['admin'],
	},
	{
		title: 'Consultations',
		url: '/admin/consultation',
		icon: Calendar,
		roles: ['admin'],
		permissions: [MODULES.READ_CONSULTATION],
	},
	{
		title: 'Instructors',
		url: '/admin/instructors',
		icon: GraduationCap,
		roles: ['admin'],
		permissions: [MODULES.READ_USER],
	},
	{
		title: 'Users',
		url: '/admin/users',
		icon: Users,
		roles: ['admin'],
		permissions: [MODULES.READ_USER],
	},
	{
		title: 'Roles',
		url: '/admin/roles',
		icon: Shield,
		roles: ['admin'],
		permissions: [MODULES.READ_ROLE],
	},
	{
		title: 'Logs',
		url: '/admin/logs',
		icon: ClipboardClock,
		roles: ['admin'],
		permissions: [MODULES.READ_LOG],
	},
	{
		title: 'Reports',
		url: '/admin/reports',
		icon: ReceiptPoundSterling,
		roles: ['admin'],
		permissions: [MODULES.GET_CONSULTATION_REPORT],
	},
	{
		title: 'Backups',
		url: '/admin/backups',
		icon: DatabaseBackup,
		roles: ['admin'],
		permissions: [MODULES.READ_BACKUP],
	},
];
