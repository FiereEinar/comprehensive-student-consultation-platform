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

router.use(authorizeRoles('instructor'));

router.post('/', createInstructorAvailability);
router.put('/:availabilityID', updateSingleAvailability);
router.delete('/:availabilityID', deleteSingleAvailability);

export default router;
