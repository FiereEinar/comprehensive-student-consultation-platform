import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MONGO_URI, BCRYPT_SALT } from '../constants/env';
import UserModel from '../models/user.model';
import NotificationSettingsModel, {
	defaultNotificationSettings,
} from '../models/notification-settings';
import ConsultationPurposeModel from '../models/consultation-purpose';
import AvailabilityModel from '../models/availability.model';
import SubjectModel from '../models/subject.model';
import ConsultationModel from '../models/consultation.models';
import { DEFAULT_CONSULTATION_PURPOSES } from '../constants';
import { seedAdmin } from './adminSeed';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants/env';

const SCHOOL_YEAR = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
const SEMESTER = 1;

async function createUser(data: {
	name: string;
	email: string;
	institutionalID: string;
	password: string;
	role: 'student' | 'instructor' | 'admin';
}) {
	const existing = await UserModel.findOne({ email: data.email });
	if (existing) {
		console.log(`  ↳ User already exists: ${data.email}`);
		return existing;
	}

	const hashedPassword = await bcrypt.hash(data.password, parseInt(BCRYPT_SALT));

	const user = await UserModel.create({
		...data,
		password: hashedPassword,
		googleID: '',
		googleCalendarTokens: null,
	});

	await NotificationSettingsModel.create({
		user: user._id as unknown as string,
		...defaultNotificationSettings,
	});

	if (data.role === 'instructor') {
		await ConsultationPurposeModel.create({
			purposes: DEFAULT_CONSULTATION_PURPOSES,
			createdBy: user._id as unknown as string,
		});
	}

	console.log(`  ↳ Created ${data.role}: ${data.email}`);
	return user;
}

async function seed() {
	try {
		await mongoose.connect(MONGO_URI);
		console.log('Connected to database');

		// ─── 1. Seed Admin ────────────────────────────────────────
		console.log('\n🔧 Seeding admin...');
		await seedAdmin({
			name: 'Admin User',
			email: ADMIN_EMAIL,
			institutionalID: 'admin001',
			password: ADMIN_PASSWORD,
		});

		// ─── 2. Instructors ───────────────────────────────────────
		console.log('\n👨‍🏫 Seeding instructors...');

		const instructor1 = await createUser({
			name: 'juan dela cruz',
			email: 'instructor1@buksu.edu.ph',
			institutionalID: 'INS-2025-001',
			password: 'Password123!',
			role: 'instructor',
		});

		const instructor2 = await createUser({
			name: 'maria santos',
			email: 'instructor2@buksu.edu.ph',
			institutionalID: 'INS-2025-002',
			password: 'Password123!',
			role: 'instructor',
		});

		// ─── 3. Instructor Availability ───────────────────────────
		console.log('\n📅 Seeding availability...');

		const existingAvail = await AvailabilityModel.findOne({ user: instructor1._id, schoolYear: SCHOOL_YEAR });
		if (!existingAvail) {
			// Instructor 1: Mon-Thu, 9:00 AM - 12:00 PM
			for (const day of ['Monday', 'Thursday']) {
				await AvailabilityModel.create({
					user: instructor1._id,
					day,
					startTime: '09:00',
					endTime: '12:00',
					slots: 5,
					schoolYear: SCHOOL_YEAR,
					semester: SEMESTER,
				});
			}
			console.log('  ↳ Created availability for instructor1 (Mon, Thu 9–12 AM)');
		} else {
			console.log('  ↳ Availability for instructor1 already exists');
		}

		const existingAvail2 = await AvailabilityModel.findOne({ user: instructor2._id, schoolYear: SCHOOL_YEAR });
		if (!existingAvail2) {
			// Instructor 2: Tue-Fri, 1:00 PM - 4:00 PM
			for (const day of ['Tuesday', 'Friday']) {
				await AvailabilityModel.create({
					user: instructor2._id,
					day,
					startTime: '13:00',
					endTime: '16:00',
					slots: 5,
					schoolYear: SCHOOL_YEAR,
					semester: SEMESTER,
				});
			}
			console.log('  ↳ Created availability for instructor2 (Tue, Fri 1–4 PM)');
		} else {
			console.log('  ↳ Availability for instructor2 already exists');
		}

		// ─── 4. Subjects ──────────────────────────────────────────
		console.log('\n📚 Seeding subjects...');

		let subject1 = await SubjectModel.findOne({ code: 'CS101', schoolYear: SCHOOL_YEAR });
		if (!subject1) {
			subject1 = await SubjectModel.create({
				name: 'Introduction to Computer Science',
				code: 'CS101',
				description: 'Foundational course covering basic CS concepts, algorithms, and problem solving.',
				schoolYear: SCHOOL_YEAR,
				semester: SEMESTER,
				instructors: [instructor1._id],
			});
			console.log('  ↳ Created subject: CS101');
		} else {
			console.log('  ↳ Subject CS101 already exists');
		}

		let subject2 = await SubjectModel.findOne({ code: 'IT202', schoolYear: SCHOOL_YEAR });
		if (!subject2) {
			subject2 = await SubjectModel.create({
				name: 'Web Development',
				code: 'IT202',
				description: 'Modern web development with HTML, CSS, JavaScript, and frameworks.',
				schoolYear: SCHOOL_YEAR,
				semester: SEMESTER,
				instructors: [instructor2._id],
			});
			console.log('  ↳ Created subject: IT202');
		} else {
			console.log('  ↳ Subject IT202 already exists');
		}

		// ─── 5. Students ──────────────────────────────────────────
		console.log('\n🎓 Seeding students...');

		const student1 = await createUser({
			name: 'pedro reyes',
			email: 'student1@student.buksu.edu.ph',
			institutionalID: 'STU-2025-001',
			password: 'Password123!',
			role: 'student',
		});

		const student2 = await createUser({
			name: 'ana gomez',
			email: 'student2@student.buksu.edu.ph',
			institutionalID: 'STU-2025-002',
			password: 'Password123!',
			role: 'student',
		});

		// ─── 6. Consultation (student1 → instructor1) ─────────────
		console.log('\n📝 Seeding consultations...');

		const existingConsultation = await ConsultationModel.findOne({
			student: student1._id,
			instructor: instructor1._id,
		});

		if (!existingConsultation) {
			// Schedule for next Monday at 10:00 AM
			const now = new Date();
			const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7; // next Monday
			const nextMonday = new Date(now);
			nextMonday.setDate(now.getDate() + daysUntilMonday);
			nextMonday.setHours(10, 0, 0, 0);

			await ConsultationModel.create({
				student: student1._id,
				instructor: instructor1._id,
				scheduledAt: nextMonday,
				status: 'pending',
				title: 'Need help with CS101 midterm topics',
				description: 'I would like to discuss the midterm topics and clarify some concepts about algorithms and data structures.',
				purpose: 'Academic Advising',
				subjectCode: 'CS101',
				schoolYear: SCHOOL_YEAR,
				semester: SEMESTER,
			});
			console.log(`  ↳ Created consultation: student1 → instructor1 (${nextMonday.toDateString()})`);
		} else {
			console.log('  ↳ Consultation already exists');
		}

		console.log('\n✅ Seed completed successfully!\n');
		console.log('─────────────────────────────────────');
		console.log('Demo Credentials:');
		console.log('─────────────────────────────────────');
		console.log(`Admin:       ${ADMIN_EMAIL} / (env ADMIN_PASSWORD)`);
		console.log('Instructor1: instructor1@buksu.edu.ph / Password123!');
		console.log('Instructor2: instructor2@buksu.edu.ph / Password123!');
		console.log('Student1:    student1@student.buksu.edu.ph / Password123!');
		console.log('Student2:    student2@student.buksu.edu.ph / Password123!');
		console.log('─────────────────────────────────────\n');
	} catch (err) {
		console.error('❌ Seed failed:', err);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
}

seed();
