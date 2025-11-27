import { Schema, model, Document, Types } from 'mongoose';
import { ISubject } from './subject.model';

export interface ISection extends Document {
	name: string;
	schedule?: string;
	subject: ISubject;
	students: string[];
	createdAt: Date;
	updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
	{
		name: { type: String, required: true, trim: true },
		schedule: { type: String },
		subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
		students: [{ type: String }],
	},
	{ timestamps: true }
);

const SectionModel = model<ISection>('Section', SectionSchema);
export default SectionModel;
