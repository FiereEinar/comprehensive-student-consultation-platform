import mongoose from 'mongoose';
import { EncryptPlugin } from '../utils/mongoose-encryption-plugin';

const Schema = mongoose.Schema;

export interface IRole extends mongoose.Document {
	name: string;
	description?: string;
	permissions: mongoose.Types.ObjectId[];
	createdBy: mongoose.Types.ObjectId; // admin who created the role
	createdAt: Date;
	updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			minlength: 1,
			maxlength: 50,
		},
		description: { type: String, maxlength: 200 },
		permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{
		timestamps: true,
	}
);

const roleModelEncryptedFields = ['name', 'description'];

RoleSchema.plugin(EncryptPlugin, { fields: roleModelEncryptedFields });

const RoleModel = mongoose.model('Role', RoleSchema);
export default RoleModel;
