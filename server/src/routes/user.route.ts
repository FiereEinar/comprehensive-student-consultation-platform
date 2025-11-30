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
	createUser,
	// assignRolesToUser,
} from '../controllers/user.controller';
import { authorizeRoles } from '../middlewares/auth';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';

const router = express.Router();

router.get('/', getUsersV2);

router.post(
	'/',
	authorizeRoles('admin'),
	hasRole([MODULES.CREATE_USER]),
	createUser
);

router.get('/stats', authorizeRoles('admin'), getUserStats);
router.get('/:userID', getSingleUser);
router.patch('/:userID/name', updateUserName);
router.patch('/:userID/password', updateUserPassword);

// Admin-only routes
router.patch(
	'/:userID/admin',
	authorizeRoles('admin'),
	hasRole([MODULES.UPDATE_USER]),
	updateUserByAdmin
);

router.patch(
	'/:userID/admin/password',
	authorizeRoles('admin'),
	hasRole([MODULES.UPDATE_USER]),
	updateUserPasswordByAdmin
);

router.patch(
	'/:userID/archive',
	hasRole([MODULES.ARCHIVE_USER]),
	authorizeRoles('admin'),
	archiveUser
);

export default router;
