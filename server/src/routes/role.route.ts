import { Router } from 'express';
import {
	getRoles,
	getSingleRole,
	createRole,
	updateRole,
	deleteRole,
} from '../controllers/role.controller';
import { auth, authorizeRoles } from '../middlewares/auth';

const router = Router();

// All routes require authentication and admin role
router.use(auth);
router.use(authorizeRoles('admin'));

router.get('/', getRoles);
router.get('/:roleID', getSingleRole);
router.post('/', createRole);
router.patch('/:roleID', updateRole);
router.delete('/:roleID', deleteRole);

export default router;
