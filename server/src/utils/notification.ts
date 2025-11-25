import NotificationSettingsModel from '../models/notification-settings';
import UserModel from '../models/user.model';
import AppNotificationModel from '../models/app-notification';
import { sendMail } from './email';

/**
 * Types of notifications you support
 */
export type NotificationType =
	| 'newConsultation'
	| 'statusUpdates'
	| 'reminders'
	| 'systemAnnouncements';

/**
 * Data the controller can pass
 */
interface NotificationPayload {
	emailNotification?: () => void;
	inAppNotification?: () => void;
}

/**
 * Main reusable notifier function
 */
export const notifyUser = async (
	userId: string,
	type: NotificationType,
	data: NotificationPayload
) => {
	const settings = await NotificationSettingsModel.findOne({ user: userId });
	if (!settings) return; // user has no settings stored → do nothing

	// ----------------------------------------------
	// QUIET HOURS CHECK
	// ----------------------------------------------
	if (settings.quietHours?.enabled) {
		const now = new Date();
		const currentTime = now.getHours() * 60 + now.getMinutes();

		const [startH, startM] = settings.quietHours.start.split(':').map(Number);
		const [endH, endM] = settings.quietHours.end.split(':').map(Number);

		if (startH && startM && endH && endM) {
			const quietStart = startH * 60 + startM;
			const quietEnd = endH * 60 + endM;

			// Quiet hours crossing midnight logic
			const isQuiet =
				quietStart < quietEnd
					? currentTime >= quietStart && currentTime <= quietEnd
					: currentTime >= quietStart || currentTime <= quietEnd;

			if (isQuiet) {
				console.log('Quiet hours active → suppressing notifications.');
				return;
			}
		}
	}

	// ----------------------------------------------
	// EMAIL NOTIFICATIONS
	// ----------------------------------------------
	if (
		data.emailNotification &&
		settings.email?.[type] === true // e.g. settings.email.newConsultation
	) {
		data.emailNotification?.();
	}

	// ----------------------------------------------
	// IN-APP NOTIFICATIONS
	// ----------------------------------------------
	if (
		data.inAppNotification &&
		settings.inApp?.[type] === true // e.g. settings.inApp.newConsultation
	) {
		data.inAppNotification?.();
	}
};
