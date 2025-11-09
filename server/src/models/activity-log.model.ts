import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IActivityLog extends Document {
	user?: IUser;
	action: string; // "USER_LOGIN", "UPDATE_PASSWORD", "DELETE_SUBJECT"
	description?: string; // "User John Doe updated their password"
	resourceType?: string;
	resourceId?: string;
	ipAddress?: string;
	userAgent?: string;
	status: 'success' | 'failure';
	timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
		action: { type: String, required: true },
		description: { type: String },
		resourceType: { type: String },
		resourceId: { type: String },
		ipAddress: { type: String },
		userAgent: { type: String },
		status: { type: String, enum: ['success', 'failure'], default: 'success' },
		timestamp: { type: Date, default: Date.now },
	},
	{ versionKey: false }
);

const ActivityLogModel = mongoose.model<IActivityLog>(
	'ActivityLog',
	ActivityLogSchema
);

export default ActivityLogModel;
