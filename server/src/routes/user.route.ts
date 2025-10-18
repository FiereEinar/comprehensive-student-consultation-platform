import express from 'express';
import { getUserConsultations } from '../controllers/consultation.controller';
import { getSingleUser, getUsers } from '../controllers/user.controller';
const router = express.Router();

router.get('/', getUsers);
router.get('/:userID', getSingleUser);
router.get('/:userID/consultation', getUserConsultations);

export default router;
