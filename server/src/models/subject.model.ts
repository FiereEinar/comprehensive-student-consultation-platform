import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';

export interface ISubject extends Document {
	name: string;
	code: string;
	description?: string;
	instructors: IUser[];
	schoolYear: string;
	semester: number;
	createdAt: Date;
	updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
	{
		name: { type: String, required: true, trim: true },
		code: { type: String, required: true, uppercase: true },
		description: { type: String },
		schoolYear: { type: String, required: true },
		semester: { type: Number, enum: [1, 2], required: true },
		instructors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

const SubjectModel = model('Subject', SubjectSchema);
export default SubjectModel;
