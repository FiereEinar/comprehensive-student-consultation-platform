import mongoose from 'mongoose';
import { EncryptPlugin } from '../utils/mongoose-encryption-plugin';

const Schema = mongoose.Schema;

export interface IPermission extends mongoose.Document {
	name: string;
	description?: string;
	resource: string; // e.g., 'user', 'consultation', 'backup'
	action: string; // e.g., 'create', 'read', 'update', 'delete'
	createdBy: mongoose.Types.ObjectId; // admin who created the permission
	createdAt: Date;
	updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			minlength: 1,
			maxlength: 50,
		},
		description: { type: String, maxlength: 200 },
		resource: { type: String, required: true, minlength: 1, maxlength: 50 },
		action: { type: String, required: true, minlength: 1, maxlength: 20 },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{
		timestamps: true,
	}
);

const permissionModelEncryptedFields = [
	'name',
	'description',
	'resource',
	'action',
];

PermissionSchema.plugin(EncryptPlugin, {
	fields: permissionModelEncryptedFields,
});

const PermissionModel = mongoose.model('Permission', PermissionSchema);
export default PermissionModel;
