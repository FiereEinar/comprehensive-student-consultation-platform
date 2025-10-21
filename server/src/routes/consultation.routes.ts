import express from 'express';
import {
	createConsultation,
	getConsultations,
	updateConsultationStatus,
} from '../controllers/consultation.controller';

const router = express.Router();

router.get('/', getConsultations);
router.post('/', createConsultation);
router.patch('/:consultationID', updateConsultationStatus);

export default router;
