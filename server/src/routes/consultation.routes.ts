import express from 'express';
import {
	createConsultation,
	createConsultationMeeting,
	getAdminDashboardData,
	getConsultations,
	getStatusBreakdown,
	getTodayOverview,
	updateConsultationStatus,
} from '../controllers/consultation.controller';

const router = express.Router();

router.get('/', getConsultations);
router.get('/dashboard-data', getAdminDashboardData);
router.get('/today-overview', getTodayOverview);
router.get('/status-breakdown', getStatusBreakdown);
router.post('/', createConsultation);
router.post('/create-meeting', createConsultationMeeting);
router.patch('/:consultationID', updateConsultationStatus);

export default router;
