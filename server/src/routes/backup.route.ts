import { Router } from 'express';
import {
	backupHistory,
	deleteBackup,
	downloadBackup,
	manualBackup,
	restoreBackup,
} from '../controllers/backup.controller';
import { authorizeRoles } from '../middlewares/auth';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';

const router = Router();

router.use(authorizeRoles('admin'));

router.post('/manual', hasRole([MODULES.CREATE_BACKUP]), manualBackup);
router.get('/history', hasRole([MODULES.READ_BACKUP]), backupHistory);
router.get('/download', hasRole([MODULES.DOWNLOAD_BACKUP]), downloadBackup);
router.post('/restore', hasRole([MODULES.RESTORE_BACKUP]), restoreBackup);
router.delete('/', hasRole([MODULES.DELETE_BACKUP]), deleteBackup);

export default router;
