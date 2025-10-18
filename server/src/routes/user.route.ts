import express from 'express';
import { getUserConsultations } from '../controllers/consultation.controller';
import { getSingleUser, getUsers } from '../controllers/user.controller';
import {
	getInstructorAvailability,
	updateInstructorAvailability,
} from '../controllers/availability.controller';
const router = express.Router();

router.get('/', getUsers);
router.get('/:userID', getSingleUser);

router.get('/:userID/consultation', getUserConsultations);

router.get('/:userID/availability', getInstructorAvailability);
router.put('/:userID/availability', updateInstructorAvailability);

export default router;
