import { Router } from 'express';
import {
	getNotificationSettings,
	updateNotificationSettings,
} from '../controllers/notification-settings.controller';

const router = Router();

router.get('/notification', getNotificationSettings);

router.post('/notification', updateNotificationSettings);

export default router;
