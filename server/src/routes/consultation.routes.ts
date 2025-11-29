import express from 'express';

import {
	acquireLock,
	createConsultation,
	createConsultationMeeting,
	deleteConsultation,
	getAdminDashboardData,
	// getConsultations,
	getConsultationsV2,
	getStatusBreakdown,
	getTodayOverview,
	updateConsultation,
	updateConsultationInstructorNotes,
	updateConsultationStatus,
	getConsultationReport,
} from '../controllers/consultation.controller';

import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', getConsultationsV2);
router.post('/', createConsultation);

router.get(
	'/dashboard-data',
	authorizeRoles('instructor', 'admin'),
	getAdminDashboardData
);

router.get('/today-overview', getTodayOverview);
router.get('/status-breakdown', getStatusBreakdown);

router.post(
	'/create-meeting',
	authorizeRoles('instructor'),
	createConsultationMeeting
);

router.get('/:consultationID/lock', acquireLock);
router.patch('/:consultationID', updateConsultation);

router.patch(
	'/:consultationID/status',
	authorizeRoles('instructor'),
	updateConsultationStatus
);

router.patch(
	'/:consultationID/instructor-notes',
	authorizeRoles('instructor'),
	updateConsultationInstructorNotes
);

router.delete(
	'/:consultationID',
	authorizeRoles('instructor'),
	deleteConsultation
);

router.get('/report', getConsultationReport);

export default router;
