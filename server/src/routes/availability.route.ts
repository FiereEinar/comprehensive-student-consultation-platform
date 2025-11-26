import express from 'express';
import {
	updateSingleAvailability,
	deleteSingleAvailability,
	getInstructorAvailability,
	createInstructorAvailability,
} from '../controllers/availability.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', getInstructorAvailability);
router.post('/', authorizeRoles('instructor'), createInstructorAvailability);

router.put(
	'/:availabilityID',
	authorizeRoles('instructor'),
	updateSingleAvailability
);

router.delete(
	'/:availabilityID',
	authorizeRoles('instructor'),
	deleteSingleAvailability
);

export default router;
