import express from 'express';
import {
	createConsultationPurpose,
	deleteConsultationPurpose,
	getInstructorConsultationPurposes,
	updateConsultationPurpose,
} from '../controllers/consultation-purpose.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.post('/', authorizeRoles('instructor'), createConsultationPurpose);
router.get('/instructor/:id', getInstructorConsultationPurposes);
router.patch('/:id', authorizeRoles('instructor'), updateConsultationPurpose);
router.delete('/:id', authorizeRoles('instructor'), deleteConsultationPurpose);

export default router;
