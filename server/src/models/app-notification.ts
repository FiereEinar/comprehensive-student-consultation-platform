import mongoose from 'mongoose';
import { IUser } from './user.model';

const Schema = mongoose.Schema;

export interface IAppNotification extends mongoose.Document {
	user: IUser;
	title: string;
	message?: string;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const AppNotificationSchema = new Schema<IAppNotification>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		title: { type: String, required: true },
		message: { type: String, required: false },
		isRead: { type: Boolean, default: false },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	}
);

const AppNotificationModel = mongoose.model<IAppNotification>(
	'AppNotification',
	AppNotificationSchema
);

export default AppNotificationModel;
