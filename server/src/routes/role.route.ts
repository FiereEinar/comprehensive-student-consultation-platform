import { Router } from 'express';
import {
	getRoles,
	getSingleRole,
	createRole,
	updateRole,
	deleteRole,
} from '../controllers/role.controller';
import { auth, authorizeRoles } from '../middlewares/auth';
import { MODULES } from '../constants';
import { hasRole } from '../middlewares/authorization.middleware';

const router = Router();

// All routes require  admin role
router.use(authorizeRoles('admin'));

router.get('/', hasRole([MODULES.READ_ROLE]), getRoles);
router.get('/:roleID', hasRole([MODULES.READ_ROLE]), getSingleRole);
router.post('/', hasRole([MODULES.CREATE_ROLE]), createRole);
router.patch('/:roleID', hasRole([MODULES.UPDATE_ROLE]), updateRole);
router.delete('/:roleID', hasRole([MODULES.DELETE_ROLE]), deleteRole);

export default router;
