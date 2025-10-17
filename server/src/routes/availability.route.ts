import express from 'express';
import {
	getInstructorAvailability,
	updateInstructorAvailability,
} from '../controllers/availability.controller';

const router = express.Router();

router.put('/instructor/:instructorID', updateInstructorAvailability);
router.get('/instructor/:instructorID', getInstructorAvailability);

export default router;
