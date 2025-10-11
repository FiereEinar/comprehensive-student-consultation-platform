import mongoose from 'mongoose';
import { MONGO_URI } from '../constants/env';

export default async function connectToMongoDB(): Promise<void> {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('Connected to database successfully');
	} catch (err: any) {
		console.error('Failed to connect to MongoDB', err);
	}
}
