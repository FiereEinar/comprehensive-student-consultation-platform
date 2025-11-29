import mongoose from 'mongoose';
import { EncryptPlugin } from '../utils/mongoose-encryption-plugin';

const Schema = mongoose.Schema;

export type UserTypes = 'admin' | 'student' | 'instructor';

export interface IUser extends mongoose.Document {
	name: string;
	institutionalID: string;
	email: string;
	password: string;
	role: UserTypes; // Keep for backward compatibility
	roles: mongoose.Types.ObjectId[]; // New RBAC roles
	profilePicture?: string;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date | undefined;
	googleID: string;
	googleCalendarTokens: any;
	archived: boolean;
	createdAt: Date;
	updatedAt: Date;
	omitPassword: () => Omit<IUser, 'password'>;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, minlength: 1, maxlength: 50, required: true },
		email: { type: String, required: false },
		password: { type: String, required: true },
		googleID: { type: String },
		institutionalID: {
			type: String,
			minlength: 1,
			maxlength: 50,
			required: true,
		},
		role: {
			type: String,
			enum: ['admin', 'student', 'instructor'],
			default: 'student',
			required: true,
		},
		roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
		resetPasswordToken: { type: String, required: false },
		resetPasswordExpires: { type: Date, required: false },
		profilePicture: { type: String, required: false },
		archived: { type: Boolean, required: true, default: false },
		googleCalendarTokens: {
			type: Object,
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

UserSchema.methods.omitPassword = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

UserSchema.pre('save', async function (next) {
	this.name = this.name.toLowerCase();
	next();
});

export const userModelEncryptedFields = [
	'name',
	'institutionalID',
	'profilePicture',
	// 'resetPasswordToken',
	// 'resetPasswordExpires',
	'googleID',
];

UserSchema.plugin(EncryptPlugin, { fields: userModelEncryptedFields });

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
