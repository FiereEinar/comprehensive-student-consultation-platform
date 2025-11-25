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

// router.put(
// 	'/availability/:availabilityID',
// 	authorizeRoles('instructor'),
// 	updateSingleAvailability
// );

router.post('/', authorizeRoles('instructor'), createInstructorAvailability);

// router.put(
// 	'/:userID/availability',
// 	authorizeRoles('instructor'),
// 	updateInstructorAvailability
// );

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
