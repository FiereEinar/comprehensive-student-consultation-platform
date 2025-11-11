import mongoose from 'mongoose';
import { MONGO_URI } from '../constants/env';

let isConnected = false;

export default async function connectToMongoDB(): Promise<void> {
	try {
		if (isConnected) return;
		await mongoose.connect(MONGO_URI);
		isConnected = true;
		console.log('Connected to database successfully');
	} catch (err: any) {
		console.error('Failed to connect to MongoDB', err);
	}
}
