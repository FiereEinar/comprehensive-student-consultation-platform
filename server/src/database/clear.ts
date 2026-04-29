import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MONGO_URI } from '../constants/env';

async function clearDatabase() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('Connected to database');

		console.log('\n⚠️  Clearing all database collections...\n');

		const collections = await mongoose.connection.db!.listCollections().toArray();
		
		for (const collection of collections) {
			const name = collection.name;
			await mongoose.connection.db!.dropCollection(name);
			console.log(`  ✗ Dropped: ${name}`);
		}

		console.log('\n✅ All collections cleared successfully!\n');
	} catch (err) {
		console.error('❌ Clear failed:', err);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
}

clearDatabase();
