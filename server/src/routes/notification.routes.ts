import { Router } from 'express';
import { auth } from '../middlewares/auth';
import {
	getUserNotifications,
	markNotificationRead,
	deleteNotification,
	markAllRead,
	clearReadNotifications,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', auth, getUserNotifications);
router.patch('/mark-all-read', auth, markAllRead);
router.delete('/clear-read', auth, clearReadNotifications);
router.patch('/:id/read', auth, markNotificationRead);
router.delete('/:id', auth, deleteNotification);

export default router;
