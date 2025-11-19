import express from 'express';
import { getUserConsultations } from '../controllers/consultation.controller';
import {
	getSingleUser,
	getUsers,
	updateUserName,
	updateUserPassword,
} from '../controllers/user.controller';
import {
	getInstructorAvailability,
	updateInstructorAvailability,
	createInstructorAvailability,
	updateSingleAvailability,
} from '../controllers/availability.controller'; //
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', getUsers);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

router.get('/:userID/consultation', getUserConsultations);

router.get(
	'/:userID/availability',
	authorizeRoles('instructor'),
	getInstructorAvailability
);

router.put(
	'/availability/:availabilityID',
	authorizeRoles('instructor'),
	updateSingleAvailability
);

router.post(
	'/:userID/availability',
	authorizeRoles('instructor'),
	createInstructorAvailability
);

router.put(
	'/:userID/availability',
	authorizeRoles('instructor'),
	updateInstructorAvailability
);
// router.put('/:userID/availability/:availabilityID/meet', generateDailyMeetLink);
export default router;
