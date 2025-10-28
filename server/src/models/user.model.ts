import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export type UserTypes = 'admin' | 'student' | 'instructor';

export interface IUser extends mongoose.Document {
	name: string;
	institutionalID: string;
	email: string;
	password: string;
	googleID: string;
	role: UserTypes;
	resetPasswordToken?: string;
	resetPasswordExpires?: Date | undefined;
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
		resetPasswordToken: { type: String, required: false },
		resetPasswordExpires: { type: Date, required: false },
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

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
