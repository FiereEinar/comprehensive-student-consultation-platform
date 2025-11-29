import express from 'express';
import {
	getSingleUser,
	getUsers,
	updateUserName,
	updateUserPassword,
} from '../controllers/user.controller';

const router = express.Router();

router.get('/', getUsers);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

export default router;
