import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export type UserTypes = 'admin' | 'student' | 'instructor';

export interface IUser extends mongoose.Document {
	name: string;
	institutionalID: string;
	email: string;
	password: string;
	role: UserTypes;
	omitPassword: () => Omit<IUser, 'password'>;
}

const UserSchema = new Schema<IUser>(
	{
		name: { type: String, minlength: 1, maxlength: 50, required: true },
		email: { type: String, required: false },
		password: { type: String, required: true },
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

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
