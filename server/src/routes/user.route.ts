import express from 'express';
import {
	getSingleUser,
	// getUsers,
	getUsersV2,
	updateUserName,
	updateUserPassword,
	updateUserByAdmin,
	updateUserPasswordByAdmin,
	archiveUser,
	getUserStats,
} from '../controllers/user.controller';
import { authorizeRoles } from '../middlewares/auth';

const router = express.Router();

router.get('/', getUsersV2);
router.get('/stats', authorizeRoles('admin'), getUserStats);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

// Admin-only routes
router.patch('/:userID/admin', authorizeRoles('admin'), updateUserByAdmin);
router.patch(
	'/:userID/admin/password',
	authorizeRoles('admin'),
	updateUserPasswordByAdmin
);
router.patch('/:userID/archive', authorizeRoles('admin'), archiveUser);

export default router;
