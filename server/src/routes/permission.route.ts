import { Router } from 'express';
import {
	getPermissions,
	getSinglePermission,
	createPermission,
	updatePermission,
	deletePermission,
} from '../controllers/permission.controller';
import { auth, authorizeRoles } from '../middlewares/auth';

const router = Router();

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles('admin'));

router.get('/', getPermissions);
router.get('/:permissionID', getSinglePermission);
router.post('/', createPermission);
router.patch('/:permissionID', updatePermission);
router.delete('/:permissionID', deletePermission);

export default router;
