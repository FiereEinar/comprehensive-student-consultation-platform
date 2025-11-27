import mongoose from 'mongoose';
import { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } from '../constants/env';
import { seedAdmin } from './adminSeed';

// let isConnected = false;

export default async function connectToMongoDB(): Promise<void> {
	try {
		// if (isConnected) return;
		await mongoose.connect(MONGO_URI);
		// isConnected = true;
		console.log('Connected to database successfully');
		await seedAdmin({
			name: 'Admin User',
			email: ADMIN_EMAIL,
			institutionalID: 'admin001',
			password: ADMIN_PASSWORD,
		});
	} catch (err: any) {
		console.error('Failed to connect to MongoDB', err);
	}
}
