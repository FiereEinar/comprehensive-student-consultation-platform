import express from 'express';
import {
	createConsultation,
	getConsultations,
} from '../controllers/consultation.controller';

const router = express.Router();

router.get('/', getConsultations);
router.post('/', createConsultation);

export default router;
