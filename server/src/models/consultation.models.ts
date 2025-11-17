import mongoose from 'mongoose';
import { IUser } from './user.model';

const Schema = mongoose.Schema;

export type ConsultationStatus =
	| 'pending'
	| 'accepted'
	| 'declined'
	| 'completed';

export interface IConsultation extends mongoose.Document {
	student: IUser;
	instructor: IUser;
	scheduledAt: Date;
	status: ConsultationStatus;
	title: string;
	description: string;
	meetLink?: string;
	googleCalendarEventId?: string | null;
	purpose: string;
	sectonCode: string;
	subjectCode: string;
	createdAt: Date;
	updatedAt: Date;
}

const ConsultationSchema = new Schema(
	{
		student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		scheduledAt: { type: Date, required: true },
		status: {
			type: String,
			enum: ['pending', 'accepted', 'declined', 'completed'],
			default: 'pending',
			required: true,
		},
		title: { type: String, required: true },
		meetLink: { type: String, default: null },
		googleCalendarEventId: { type: String, default: null },
		description: { type: String, required: true },
		purpose: { type: String, required: true },
		sectonCode: { type: String, required: true },
		subjectCode: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

const ConsultationModel = mongoose.model('Consultation', ConsultationSchema);
export default ConsultationModel;
