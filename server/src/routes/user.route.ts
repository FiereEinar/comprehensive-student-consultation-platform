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
    updateSingleAvailability 
} from '../controllers/availability.controller'; //

const router = express.Router();

router.get('/', getUsers);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

router.get('/:userID/consultation', getUserConsultations);

router.get('/:userID/availability', getInstructorAvailability);
router.put('/availability/:availabilityID', updateSingleAvailability);
router.post('/:userID/availability', createInstructorAvailability); 

export default router;
