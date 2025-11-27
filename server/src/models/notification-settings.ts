import mongoose from 'mongoose';
import { IUser } from './user.model';

const Schema = mongoose.Schema;

export interface INotificationSettings extends mongoose.Document {
	_id: string;
	user: IUser;
	email: {
		newConsultation: boolean;
		statusUpdates: boolean;
		reminders: boolean;
		systemAnnouncements: boolean;
	};
	inApp: {
		newConsultation: boolean;
		statusUpdates: boolean;
		reminders: boolean;
		systemAnnouncements: boolean;
	};
	quietHours: {
		enabled: boolean;
		start: string;
		end: string;
	};
}

export const defaultNotificationSettings: Partial<INotificationSettings> = {
	email: {
		newConsultation: true,
		statusUpdates: true,
		reminders: true,
		systemAnnouncements: true,
	},
	inApp: {
		newConsultation: true,
		statusUpdates: true,
		reminders: true,
		systemAnnouncements: true,
	},
	quietHours: {
		enabled: false,
		start: '21:00',
		end: '07:00',
	},
};

const NotificationSettingsSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	email: {
		newConsultation: { type: Boolean, default: true },
		statusUpdates: { type: Boolean, default: true },
		reminders: { type: Boolean, default: true },
		systemAnnouncements: { type: Boolean, default: true },
	},
	inApp: {
		newConsultation: { type: Boolean, default: true },
		statusUpdates: { type: Boolean, default: true },
		reminders: { type: Boolean, default: true },
		systemAnnouncements: { type: Boolean, default: true },
	},
	quietHours: {
		enabled: { type: Boolean, default: false },
		start: { type: String, default: '21:00' },
		end: { type: String, default: '07:00' },
	},
});

const NotificationSettingsModel = mongoose.model(
	'NotificationSettings',
	NotificationSettingsSchema
);
export default NotificationSettingsModel;
