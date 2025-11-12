import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';

export interface ISubject extends Document {
	name: string;
	code: string;
	description?: string;
	instructor: IUser;
	createdAt: Date;
	updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
	{
		name: { type: String, required: true, trim: true },
		code: { type: String, required: true, uppercase: true },
		description: { type: String },
		instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true }
);

const SubjectModel = model('Subject', SubjectSchema);
export default SubjectModel;
