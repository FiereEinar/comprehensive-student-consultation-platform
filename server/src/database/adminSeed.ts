import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel, { UserTypes } from '../models/user.model';

interface AdminSeedOptions {
	name: string;
	email: string;
	institutionalID: string;
	password: string;
}

export const seedAdmin = async (options: AdminSeedOptions) => {
	try {
		// Check if admin already exists
		const existingAdmin = await UserModel.findOne({ email: options.email });
		if (existingAdmin) {
			console.log('Admin account already exists:', options.email);
			return;
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(options.password, 10);

		// Create admin user
		const admin = await UserModel.create({
			name: options.name,
			email: options.email,
			institutionalID: options.institutionalID,
			password: hashedPassword,
			role: 'admin' as UserTypes,
			googleID: '',
			googleCalendarTokens: null,
		});

		console.log('Admin account created:', admin.email);
	} catch (err) {
		console.error('Failed to seed admin account:', err);
	}
};
