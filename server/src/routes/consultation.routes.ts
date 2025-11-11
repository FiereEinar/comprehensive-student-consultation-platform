import express from 'express';
import {
	createConsultation,
	createConsultationMeeting,
	getAdminDashboardData,
	getConsultations,
	updateConsultationStatus,
} from '../controllers/consultation.controller';

const router = express.Router();

router.get('/', getConsultations);
router.get('/dashboard-data', getAdminDashboardData);
router.post('/', createConsultation);
router.post('/create-meeting', createConsultationMeeting);
router.patch('/:consultationID', updateConsultationStatus);

export default router;
