import express from 'express';

import {
	createConsultation,
	getAdminDashboardData,
	getConsultations,
	updateConsultationStatus,
} from '../controllers/consultation.controller';

const router = express.Router();

router.get('/', getConsultations);
router.get('/dashboard-data', getAdminDashboardData);
router.post('/', createConsultation);
router.patch('/:consultationID', updateConsultationStatus);


export default router;

