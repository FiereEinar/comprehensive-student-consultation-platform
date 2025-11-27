import mongoose from 'mongoose';
import { IUser } from './user.model';
import { decrypt, encrypt } from '../utils/encryption';
import { EncryptPlugin } from '../utils/mongoose-encryption-plugin';

const Schema = mongoose.Schema;

export type ConsultationStatus =
	| 'pending'
	| 'accepted'
	| 'declined'
	| 'completed';

export interface IConsultation extends mongoose.Document {
	_id: string;
	student: IUser;
	instructor: IUser;
	scheduledAt: Date;
	status: ConsultationStatus;
	title: string;
	description: string;
	meetLink?: string;
	googleCalendarEventId?: string | null;
	purpose: string;
	sectonCode?: string;
	subjectCode?: string;
	completedAt?: Date;
	instructorNotes?: string;
	lock: {
		lockedBy: IUser | null;
		lockedAt: Date | null;
	};
	createdAt: Date;
	updatedAt: Date;
	toJSON(): IConsultation;
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
		purpose: { type: String, required: false },
		sectonCode: { type: String, required: false },
		subjectCode: { type: String, required: false },
		completedAt: { type: Date, required: false },
		instructorNotes: { type: String, required: false },
		lock: {
			lockedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
			lockedAt: { type: Date, default: null },
		},
	},
	{
		timestamps: true,
	}
);

export const consultatioModelEncryptedFields = [
	'title',
	'description',
	'purpose',
	'googleCalendarEventId',
	'sectonCode',
	'subjectCode',
];

ConsultationSchema.plugin(EncryptPlugin, {
	fields: consultatioModelEncryptedFields,
});

const ConsultationModel = mongoose.model('Consultation', ConsultationSchema);
export default ConsultationModel;
