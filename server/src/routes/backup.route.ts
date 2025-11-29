import { Router } from 'express';
import {
	backupHistory,
	deleteBackup,
	downloadBackup,
	manualBackup,
	restoreBackup,
} from '../controllers/backup.controller';
import { auth, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.post('/manual', auth, authorizeRoles('admin'), manualBackup);
router.get('/history', auth, authorizeRoles('admin'), backupHistory);
router.get('/download', auth, authorizeRoles('admin'), downloadBackup);
router.post('/restore', auth, authorizeRoles('admin'), restoreBackup);
router.delete('/', auth, authorizeRoles('admin'), deleteBackup);

export default router;
