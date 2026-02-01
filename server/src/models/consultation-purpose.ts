import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface IConsultationPurpose extends mongoose.Document {
	_id: mongoose.Types.ObjectId;
	purposes: string[];
	createdBy: mongoose.Types.ObjectId; // instructor who created the purpose
	createdAt: Date;
	updatedAt: Date;
}

const ConsultationPurposeSchema = new Schema<IConsultationPurpose>(
	{
		purposes: [{ type: String, required: true }],
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{
		timestamps: true,
	},
);

const ConsultationPurposeModel = mongoose.model<IConsultationPurpose>(
	'ConsultationPurpose',
	ConsultationPurposeSchema,
);
export default ConsultationPurposeModel;
