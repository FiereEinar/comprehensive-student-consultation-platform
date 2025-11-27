import express from 'express';
import {
	createConsultation,
	createConsultationMeeting,
	deleteConsultation,
	getAdminDashboardData,
	getConsultations,
	getStatusBreakdown,
	getTodayOverview,
	updateConsultation,
	updateConsultationInstructorNotes,
	updateConsultationStatus,
} from '../controllers/consultation.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', getConsultations);
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

export default router;
