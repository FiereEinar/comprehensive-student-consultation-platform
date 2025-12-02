import { Router } from 'express';
import {
	backupHistory,
	deleteBackup,
	downloadBackup,
	getDropboxBackups,
	importBackup,
	manualBackup,
	manualCloudBackup,
	restoreBackup,
} from '../controllers/backup.controller';
import { authorizeRoles } from '../middlewares/auth';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';
import upload from '../utils/multer';

const router = Router();

router.use(authorizeRoles('admin'));

router.post('/manual', hasRole([MODULES.CREATE_BACKUP]), manualBackup);

router.post(
	'/manual/cloud',
	hasRole([MODULES.CREATE_BACKUP]),
	manualCloudBackup
);

router.get('/history', hasRole([MODULES.READ_BACKUP]), backupHistory);

router.get('/history/cloud', hasRole([MODULES.READ_BACKUP]), getDropboxBackups);

router.get('/download', hasRole([MODULES.DOWNLOAD_BACKUP]), downloadBackup);

router.post('/restore', hasRole([MODULES.RESTORE_BACKUP]), restoreBackup);

router.post(
	'/import',
	hasRole([MODULES.RESTORE_BACKUP]),
	upload.single('backupZip'),
	importBackup
);

router.delete('/', hasRole([MODULES.DELETE_BACKUP]), deleteBackup);

export default router;
