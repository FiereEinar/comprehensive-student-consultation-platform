import express from 'express';
import {
	acquireLock,
	createConsultation,
	createConsultationMeeting,
	deleteConsultation,
	getAdminDashboardData,
	getConsultationsV2,
	getStatusBreakdown,
	getTodayOverview,
	updateConsultation,
	updateConsultationInstructorNotes,
	updateConsultationStatus,
	getConsultationReport,
} from '../controllers/consultation.controller';
import { authorizeRoles } from '../middlewares/auth';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';

const router = express.Router();

router.get('/', hasRole([MODULES.READ_CONSULTATION]), getConsultationsV2);

router.post('/', hasRole([MODULES.CREATE_CONSULTATION]), createConsultation);

router.get(
	'/dashboard-data',
	authorizeRoles('instructor', 'admin'),
	getAdminDashboardData
);

router.get('/today-overview', getTodayOverview);

router.get('/status-breakdown', getStatusBreakdown);

router.post(
	'/create-meeting',
	authorizeRoles('instructor', 'admin'),
	hasRole([MODULES.CREATE_CONSULTATION_MEETING]),
	createConsultationMeeting
);

router.get('/:consultationID/lock', acquireLock);

router.patch(
	'/:consultationID',
	hasRole([MODULES.UPDATE_CONSULTATION]),
	updateConsultation
);

router.patch(
	'/:consultationID/status',
	authorizeRoles('instructor', 'admin'),
	hasRole([MODULES.UPDATE_CONSULTATION_STATUS]),
	updateConsultationStatus
);

router.patch(
	'/:consultationID/instructor-notes',
	authorizeRoles('instructor', 'admin'),
	hasRole([MODULES.UPDATE_CONSULTATION_NOTES]),
	updateConsultationInstructorNotes
);

router.delete(
	'/:consultationID',
	authorizeRoles('instructor', 'admin'),
	hasRole([MODULES.DELETE_CONSULTATION]),
	deleteConsultation
);

router.get(
	'/report',
	authorizeRoles('admin'),
	hasRole([MODULES.GET_CONSULTATION_REPORT]),
	getConsultationReport
);

export default router;
