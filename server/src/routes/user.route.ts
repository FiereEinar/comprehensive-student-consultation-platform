import express from 'express';
import {
	getSingleUser,
	// getUsers,
	getUsersV2,
	updateUserName,
	updateUserPassword,
} from '../controllers/user.controller';

const router = express.Router();

router.get('/', getUsersV2);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

export default router;
