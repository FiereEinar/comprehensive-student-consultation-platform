import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
	_id: string;
	email: string;
	name?: string;
	role: 'instructor';
	token: string;
	expiresAt: Date;
	status: 'pending' | 'accepted' | 'expired';
}

const InvitationSchema = new Schema<IInvitation>(
	{
		email: { type: String, required: true },
		name: { type: String },
		role: { type: String, enum: ['instructor'], default: 'instructor' },
		token: { type: String, required: true },
		expiresAt: { type: Date, required: true },
		status: {
			type: String,
			enum: ['pending', 'accepted', 'expired'],
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

const InvitationModel = mongoose.model('Invitation', InvitationSchema);
export default InvitationModel;
