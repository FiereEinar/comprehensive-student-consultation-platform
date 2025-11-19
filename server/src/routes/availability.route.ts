import express from 'express';
import {
	updateSingleAvailability,
	deleteSingleAvailability,
} from '../controllers/availability.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();
router.put(
	'/:availabilityID',
	authorizeRoles('instructor'),
	updateSingleAvailability
);

router.delete(
	'/:availabilityID',
	authorizeRoles('instructor'),
	deleteSingleAvailability
); // <--- Add this line

export default router;
