import mongoose from 'mongoose';
import { IUser } from './user.model';

const Schema = mongoose.Schema;

export type ConsultationStatus =
	| 'pending'
	| 'accepted'
	| 'declined'
	| 'completed';

export interface IConsultation {
	student: IUser;
	instructor: IUser;
	scheduledAt: Date;
	status: ConsultationStatus;
	location: string;
	title: string;
	description: string;
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
		description: { type: String, required: true },
	},
	{
		timestamps: true,
	}
);

const ConsultationModel = mongoose.model('Consultation', ConsultationSchema);
export default ConsultationModel;
