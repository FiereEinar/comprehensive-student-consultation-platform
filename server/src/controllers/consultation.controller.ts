// File: src/controllers/consultation.controller.ts

import asynchandler from 'express-async-handler';
import { Request, Response } from 'express';
import {
	consutationStatusSchema,
	createConsultationSchema,
	updateConsultationSchema,
} from '../schemas/consultation.schema';
import ConsultationModel, {
	consultatioModelEncryptedFields,
	IConsultation,
} from '../models/consultation.models';
import CustomResponse, { CustomPaginatedResponse } from '../utils/response';
import UserModel, { IUser } from '../models/user.model';
import appAssert from '../errors/app-assert';
import {
	BAD_REQUEST,
	CONFLICT,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	UNAUTHORIZED,
} from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import { getStartAndEndofDay, ONE_MINUTE_MS } from '../utils/date';
import { DEFAULT_LIMIT, RESOURCE_TYPES } from '../constants';
import { subDays } from 'date-fns';
import { logActivity } from '../utils/activity-logger';
import { oAuth2Client } from '../utils/google-client';
import { google } from 'googleapis';
import {
	EMAIL_USER,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
} from '../constants/env';
import { sendMail } from '../utils/email';
import { createGoogleMeetLink } from '../utils/google-meet';
import {
	createCalendarEvent,
	createGoogleCalendarOnStatusUpdate,
} from '../utils/google-calendar';
import {
	sendConsultationEmail,
	sendConsultationStatusUpdateEmail,
	sendPendingConsultationEmail,
} from '../utils/consultation-email';
import { custom, json } from 'zod';
import { Types } from 'mongoose';
import { notifyUser } from '../utils/notification';
import AppNotificationModel from '../models/app-notification';
import { startCase } from 'lodash';
import { decryptFields, encrypt } from '../utils/encryption';

/**
 * @route GET /api/v1/consultation - get all recent consultations
 * @query page=1
 * @query pageSize=10
 * @query search=keyword
 * @query order=asc | desc
 * @query userID=studentOrInstructorID
 * @query status=pending,accepted,completed
 */
export const getConsultations = asynchandler(async (req, res) => {
	const {
		page = 1,
		pageSize = 10,
		search = '',
		sort = 'desc',
		status = '',
		userID = '',
		fetchAll = false,
	} = req.query;

	const numericPage = Number(page);
	const limit = Number(pageSize);
	const skip = (numericPage - 1) * limit;

	const match: any = {};

	// filter by status (can be 'pending,accepted')
	if (status) {
		const statuses = (status as string).split(',').map((s) => s.trim());
		match.status = { $in: statuses };
	}

	// filter by specific student/instructor
	if (userID) {
		const objectID = new Types.ObjectId(userID as string);
		match.$or = [{ student: objectID }, { instructor: objectID }];
	}

	// AGGREGATION PIPELINE
	const pipeline: any[] = [
		{ $match: match },

		// JOIN student collection
		{
			$lookup: {
				from: 'users',
				localField: 'student',
				foreignField: '_id',
				as: 'student',
			},
		},
		{ $unwind: '$student' },

		// JOIN instructor collection
		{
			$lookup: {
				from: 'users',
				localField: 'instructor',
				foreignField: '_id',
				as: 'instructor',
			},
		},
		{ $unwind: '$instructor' },
	];

	/** -------------------------------
	 * SEARCH LOGIC
	 * --------------------------------*/
	if (String(search).trim() !== '') {
		const regex = { $regex: search, $options: 'i' };

		pipeline.push({
			$match: {
				$or: [
					{ title: regex },
					{ description: regex },
					{ purpose: regex },
					{ sectionCode: regex },
					{ subjectCode: regex },
					{ 'student.name': regex },
					{ 'student.email': regex },
					{ 'instructor.name': regex },
					{ 'instructor.email': regex },
				],
			},
		});
	}

	/** -------------------------------
	 * SORTING
	 * --------------------------------*/
	pipeline.push({
		$sort: { createdAt: sort === 'asc' ? 1 : -1 },
	});

	/** -------------------------------
	 * PAGINATION
	 * --------------------------------*/
	pipeline.push({ $skip: skip });

	if (!Boolean(fetchAll)) {
		pipeline.push({ $limit: limit });
	}

	// Get paginated data
	let consultations = await ConsultationModel.aggregate(pipeline);
	consultations = consultations.map((c) =>
		decryptFields(c, consultatioModelEncryptedFields)
	);

	// Get total count (run pipeline without skip/limit)
	const totalPipeline = pipeline.filter(
		(stage) => !('$skip' in stage) && !('$limit' in stage)
	);
	const totalDocs = await ConsultationModel.aggregate([
		...totalPipeline,
		{ $count: 'count' },
	]);
	const total = totalDocs[0]?.count || 0;

	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(
			true,
			consultations,
			'Consultations fetched',
			next,
			prev
		)
	);
});

/**
 * handler made to work with that dumbass IAS requirement "encryption"
 */
export const getConsultationsV2 = asynchandler(async (req, res) => {
	const {
		page = 1,
		pageSize = 10,
		search = '',
		sort = 'desc',
		status = '',
		userID = '',
		fetchAll = false,
	} = req.query;

	const numericPage = Number(page);
	const limit = Number(pageSize);
	const skip = (numericPage - 1) * limit;

	/** --------------------------------------------
	 * STEP 1 — Fetch everything (NO SEARCH here)
	 * ---------------------------------------------*/
	const match: any = {};

	// Filter by status
	if (status) {
		const statuses = (status as string).split(',').map((s) => s.trim());
		match.status = { $in: statuses };
	}

	// Filter by specific student/instructor
	if (userID) {
		const objectID = new Types.ObjectId(userID as string);
		match.$or = [{ student: objectID }, { instructor: objectID }];
	}

	let consultations = await ConsultationModel.find(match)
		.populate('student')
		.populate('instructor')
		.lean();

	/** --------------------------------------------
	 * STEP 2 — DECRYPT ALL FIELDS
	 * ---------------------------------------------*/
	consultations = consultations.map((c) =>
		decryptFields(c, consultatioModelEncryptedFields)
	);

	/** --------------------------------------------
	 * STEP 3 — SEARCH FILTERING (now decrypted)
	 * ---------------------------------------------*/
	if (String(search).trim() !== '') {
		const keyword = String(search).toLowerCase();

		consultations = consultations.filter((c) => {
			const student: IUser = c.student as unknown as IUser;
			const instructor: IUser = c.instructor as unknown as IUser;

			const flat = [
				c.title,
				c.description,
				c.purpose,
				c.sectonCode,
				c.subjectCode,
				student?.name,
				student?.email,
				instructor?.name,
				instructor?.email,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return flat.includes(keyword);
		});
	}

	/** --------------------------------------------
	 * STEP 4 — SORTING
	 * ---------------------------------------------*/
	consultations.sort((a, b) => {
		const da = new Date(a.createdAt).getTime();
		const db = new Date(b.createdAt).getTime();
		return sort === 'asc' ? da - db : db - da;
	});

	/** --------------------------------------------
	 * STEP 5 — PAGINATION (after filtering)
	 * ---------------------------------------------*/
	const total = consultations.length;
	const paginated = fetchAll
		? consultations
		: consultations.slice(skip, skip + limit);

	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(
			true,
			paginated,
			'Consultations fetched',
			next,
			prev
		)
	);
});

/**
 * @route POST /api/v1/consultation - create a consultation
 */
export const createConsultation = asynchandler(async (req, res) => {
	const body = createConsultationSchema.parse(req.body);

	// check if  instructor and student exist
	const instructor = await UserModel.findById(body.instructor);
	appAssert(instructor, BAD_REQUEST, 'Instructor not found');
	const student = await UserModel.findById(body.student);
	appAssert(student, BAD_REQUEST, 'Student not found');

	// determine consultation day like "Monday"
	const consultationDate = new Date(body.scheduledAt);
	const daysOfWeek = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	const consultationDay = daysOfWeek[consultationDate.getDay()];

	const availability = await AvailabilityModel.findOne({
		user: instructor._id,
		day: consultationDay,
	});

	// if instructor has no availability then  reject
	appAssert(
		availability,
		BAD_REQUEST,
		'Instructor is not available for this day'
	);

	// check how many consultations the instructor has for this day
	const { startOfDay, endOfDay } = getStartAndEndofDay(consultationDate);
	const existingConsultations = await ConsultationModel.countDocuments({
		instructor: instructor._id,
		scheduledAt: { $gte: startOfDay, $lte: endOfDay },
		status: { $nin: ['cancelled', 'declined'] },
	});

	appAssert(
		existingConsultations < availability.slots,
		BAD_REQUEST,
		'No remaining consultation slots for this day'
	);

	if (req.user.role === 'student') {
		// if student already has a consultation for this day then reject
		const existingConsultation = await ConsultationModel.findOne({
			student: student._id,
			instructor: instructor._id,
			scheduledAt: { $gte: startOfDay, $lte: endOfDay },
			status: { $nin: ['cancelled', 'declined'] },
		});
		appAssert(
			!existingConsultation,
			BAD_REQUEST,
			'Student already has a consultation for this day'
		);
	}

	// create consultation
	const consultation = await ConsultationModel.create(body);

	// send email to the instructor
	const instructorId = String(instructor._id);
	notifyUser(instructorId, 'newConsultation', {
		emailNotification: async () => {
			if (req.user.role === 'student' || req.user.role === 'admin') {
				await sendPendingConsultationEmail({
					instructorEmail: instructor.email,
					instructorName: instructor.name,
					studentName: student.name,
					scheduledAt: consultationDate,
				});
			}
			if (req.user.role === 'instructor' || req.user.role === 'admin') {
				await sendPendingConsultationEmail({
					instructorEmail: student.email,
					instructorName: student.name,
					studentName: instructor.name,
					scheduledAt: consultationDate,
				});
			}
		},
		inAppNotification: async () => {
			if (req.user.role === 'student' || req.user.role === 'admin') {
				await AppNotificationModel.create({
					user: instructorId,
					title: `A new consultation request from ${startCase(student.name)}.`,
					message: 'Check your dashboard for more details.',
					isRead: false,
				});
			}
			if (req.user.role === 'instructor' || req.user.role === 'admin') {
				await AppNotificationModel.create({
					user: student._id,
					title: `A new consultation request from ${startCase(
						instructor.name
					)}.`,
					message: 'Check your dashboard for more details.',
					isRead: false,
				});
			}
		},
	});

	await logActivity(req, {
		action: 'CREATE_CONSULTATION',
		description: 'Created a consultation',
		resourceType: RESOURCE_TYPES.CONSULTATION,
	});

	res.json(
		new CustomResponse(true, consultation, 'Consultation request created')
	);
});

/**
 * @route PATCH /api/v1/consultation/:consultationID
 */
export const updateConsultationStatus = asynchandler(async (req, res) => {
	const currentUser = req.user;
	const { consultationID } = req.params;
	const status = consutationStatusSchema.parse(req.body.status);
	const withGMeet = Boolean(req.body.withGMeet);

	const consultation = await ConsultationModel.findById<IConsultation>(
		consultationID
	)
		.populate('student')
		.populate('instructor')
		.exec();

	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	appAssert(
		currentUser.role === 'instructor',
		BAD_REQUEST,
		'Only instructors can update consultation status'
	);

	appAssert(
		currentUser && currentUser.googleCalendarTokens,
		UNAUTHORIZED,
		'Google Calendar not connected'
	);

	consultation.status = status;
	await consultation.save();

	if (status === 'completed') {
		consultation.completedAt = new Date();
		await consultation.save();
	}

	const { student, instructor } = consultation;

	notifyUser(String(student._id), 'statusUpdates', {
		emailNotification: async () => {
			await sendConsultationStatusUpdateEmail(
				consultation,
				student,
				instructor,
				status
			);
		},
		inAppNotification: async () => {
			await AppNotificationModel.create({
				user: student._id,
				title: `Your consultation with ${startCase(
					instructor.name
				)} is ${startCase(status)}.`,
				message: 'Check your dashboard for more details.',
				isRead: false,
			});
		},
	});

	// Manage Google Calendar event based on status
	if (instructor?.googleCalendarTokens) {
		const oAuth2Client = new google.auth.OAuth2(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			GOOGLE_REDIRECT_URI
		);
		oAuth2Client.setCredentials(instructor.googleCalendarTokens);
		const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
		await createGoogleCalendarOnStatusUpdate(
			consultation,
			calendar,
			student,
			instructor,
			status,
			withGMeet
		);
	}

	await logActivity(req, {
		action: 'UPDATE_CONSULTATION',
		description: 'Updated a consultation',
		resourceId: consultationID,
		resourceType: RESOURCE_TYPES.CONSULTATION,
	});

	res.json(
		new CustomResponse(
			true,
			consultation,
			`Consultation status updated ${status}`
		)
	);
});

/**
 * @route GET /api/v1/consultation/dashboard-data
 */
export const getAdminDashboardData = asynchandler(async (req, res) => {
	// count the total number of students, instructors and consultations
	const [totalStudents, totalInstructors, totalConsultations] =
		await Promise.all([
			UserModel.countDocuments({ role: 'student' }),
			UserModel.countDocuments({ role: 'instructor' }),
			ConsultationModel.countDocuments(),
		]);

	// get pending consultations
	const pendingConsultations = await ConsultationModel.find({
		status: 'pending',
	})
		.populate('student instructor')
		.sort({ scheduledAt: -1 })
		.limit(5)
		.exec();

	// get recent consultations (latest 5 only)
	const recentConsultations = await ConsultationModel.find()
		.populate('student instructor')
		.sort({ createdAt: -1 })
		.limit(5)
		.exec();

	// get active instructors (instructors with upcoming or ongoing consultations)
	const activeInstructorIDs = await ConsultationModel.distinct('instructor', {
		status: { $in: ['pending', 'accepted'] },
		scheduledAt: { $gte: new Date() },
	});
	const activeInstructors = await UserModel.find({
		_id: { $in: activeInstructorIDs },
	}).select('name email');

	// get recently joined students (joined in last 7 days)
	const recentStudents = await UserModel.find({
		role: 'student',
		createdAt: { $gte: subDays(new Date(), 7) },
	})
		.sort({ createdAt: -1 })
		.limit(5)
		.select('name email createdAt');

	res.json(
		new CustomResponse(
			true,
			{
				totalStudents,
				totalInstructors,
				totalConsultations,
				pendingConsultations,
				recentConsultations,
				activeInstructors,
				recentStudents,
			},
			'Dashboard data fetched'
		)
	);
});

export const createConsultationMeeting = asynchandler(async (req, res) => {
	const userId = req.user._id;
	const user = await UserModel.findById(userId);
	appAssert(
		user && user.googleCalendarTokens,
		UNAUTHORIZED,
		'Google Calendar not connected'
	);

	const consultation = await ConsultationModel.findById<IConsultation>(
		req.body.consultationID
	)
		.populate('student')
		.populate('instructor')
		.exec();
	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	const { student, instructor } = consultation;
	appAssert(
		student && instructor,
		NOT_FOUND,
		'Student or instructor not found'
	);

	oAuth2Client.setCredentials(user.googleCalendarTokens);

	// Create Meet link
	const meetLink = await createGoogleMeetLink(oAuth2Client, req.body);
	appAssert(
		meetLink,
		INTERNAL_SERVER_ERROR,
		'Failed to generate Google Meet link'
	);

	consultation.meetLink = meetLink;
	await consultation.save();

	notifyUser(String(student._id), 'statusUpdates', {
		emailNotification: async () => {
			await sendConsultationEmail(student, {
				student,
				instructor,
				summary: req.body.summary,
				startTime: req.body.startTime,
				endTime: req.body.endTime,
				meetLink,
			});
		},
		inAppNotification: async () => {
			await AppNotificationModel.create({
				user: student._id,
				title: `${startCase(
					instructor.name
				)} has scheduled an online consultation with you.`,
				message: 'Check your dashboard for more details.',
				isRead: false,
			});
		},
	});

	res.json({ meetLink });
});

/**
 * @route GET /api/v1/consultation/today-overview
 */
export const getTodayOverview = asynchandler(async (req, res) => {
	const userID = req.user._id;
	const isAdmin = req.user.role === 'admin';
	const isInstructor = req.user.role === 'instructor';
	const isStudent = req.user.role === 'student';

	const start = new Date();
	start.setHours(0, 0, 0, 0);

	const end = new Date();
	end.setHours(23, 59, 59, 999);

	let todayConsultationFilter: any = {
		scheduledAt: { $gte: start, $lte: end },
	};

	if (!isAdmin && isInstructor) {
		todayConsultationFilter.instructor = userID;
	}

	if (!isAdmin && isStudent) {
		todayConsultationFilter.student = userID;
	}

	const todaysConsultations = await ConsultationModel.find(
		todayConsultationFilter
	)
		.populate('student')
		.populate('instructor')
		.sort({ startTime: 1 });

	let pendingRequestsFilter: any = { status: 'pending' };
	if (!isAdmin) {
		pendingRequestsFilter = {
			instructor: userID,
		};
	}
	const pendingRequests = await ConsultationModel.countDocuments(
		pendingRequestsFilter
	);

	const nextConsultation = todaysConsultations[0] || null;

	res.json(
		new CustomResponse(
			true,
			{
				totalToday: todaysConsultations.length,
				pendingRequests,
				nextConsultation,
				activeMeetLink: nextConsultation?.meetLink ?? null,
				reminders: ['Check pending requests', 'Review completed logs'],
			},
			"Today's overview fetched"
		)
	);
});

/**
 * @route GET /api/v1/consultation/status-breakdown
 */
export const getStatusBreakdown = asynchandler(async (req, res) => {
	const userID = req.user._id;
	const isAdmin = req.user.role === 'admin';
	const isInstructor = req.user.role === 'instructor';
	const isStudent = req.user.role === 'student';

	const statuses = ['accepted', 'pending', 'declined', 'completed'];

	let filter: any = {};
	if (!isAdmin && isInstructor) {
		filter = {
			instructor: userID,
		};
	}
	if (!isAdmin && isStudent) {
		filter = {
			student: userID,
		};
	}
	const counts = await Promise.all(
		statuses.map((s) =>
			ConsultationModel.countDocuments({ ...filter, status: s })
		)
	);

	res.json(
		new CustomResponse(
			true,
			{
				accepted: counts[0],
				pending: counts[1],
				declined: counts[2],
				completed: counts[3],
			},
			'Status breakdown fetched'
		)
	);
});

/**
 * @route DELETE /api/v1/consultation/:consultationID
 */
export const deleteConsultation = asynchandler(async (req, res) => {
	const currentUser = req.user;
	const { consultationID } = req.params;

	const consultation = await ConsultationModel.findById<IConsultation>(
		consultationID
	)
		.populate('instructor')
		.exec();
	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	appAssert(
		consultation.instructor._id?.toString() === currentUser._id.toString(),
		UNAUTHORIZED,
		'You are not authorized to delete this consultation'
	);

	if (consultation.instructor.googleCalendarTokens) {
		const oAuth2Client = new google.auth.OAuth2(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			GOOGLE_REDIRECT_URI
		);
		oAuth2Client.setCredentials(consultation.instructor.googleCalendarTokens);
		const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

		// Remove event if completed
		await calendar.events.delete({
			calendarId: 'primary',
			eventId: consultation.googleCalendarEventId as string,
		});
		consultation.googleCalendarEventId = null;
		await consultation.save();
	}

	await ConsultationModel.findByIdAndDelete(consultationID);

	res.json(new CustomResponse(true, null, 'Consultation deleted'));
});

/**
 * @route PATCH /api/v1/consultation/:consultationID/instructor-notes
 */
export const updateConsultationInstructorNotes = asynchandler(
	async (req, res) => {
		const { consultationID } = req.params;
		const { instructorNotes } = req.body;

		const consultation = await ConsultationModel.findById<IConsultation>(
			consultationID
		)
			.populate('instructor')
			.exec();
		appAssert(consultation, NOT_FOUND, 'Consultation not found');

		appAssert(
			consultation.instructor._id?.toString() === req.user._id.toString(),
			UNAUTHORIZED,
			'You are not authorized to update this consultation'
		);

		consultation.instructorNotes = instructorNotes;
		await consultation.save();

		res.json(new CustomResponse(true, null, 'Instructor notes updated'));
	}
);

/**
 * @route PATCH /api/v1/consultation/:consultationID
 */
export const updateConsultation = asynchandler(async (req, res) => {
	const { consultationID } = req.params;

	const consultation = await ConsultationModel.findById<IConsultation>(
		consultationID
	)
		.populate('instructor')
		.populate('student')
		.exec();

	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	// allowed to edit: instructor, student, admin
	const userId = req.user._id.toString();
	const instructorId = consultation.instructor?._id?.toString();
	const studentId = consultation.student?._id?.toString();
	const isAdmin = req.user.role === 'admin';

	appAssert(
		isAdmin || userId === instructorId || userId === studentId,
		UNAUTHORIZED,
		'You are not authorized to update this consultation'
	);

	// only lock owner can save
	appAssert(
		consultation.lock?.lockedBy?.toString() === req.user._id.toString(),
		CONFLICT,
		'Another user is currently editing this consultation.'
	);

	const body = updateConsultationSchema.parse(req.body);

	const updated = await ConsultationModel.findByIdAndUpdate<IConsultation>(
		consultationID,
		body,
		{ new: true }
	);

	appAssert(updated, NOT_FOUND, 'Failed to update consultation');

	updated.lock = { lockedBy: null, lockedAt: null };
	await updated.save();

	await logActivity(req, {
		action: 'UPDATE_CONSULTATION',
		description: 'Updated a consultation',
		resourceId: consultationID,
		resourceType: RESOURCE_TYPES.CONSULTATION,
	});

	res.json(new CustomResponse(true, updated, 'Consultation updated'));
});

/**
 * @route GET /api/v1/consultation/:consultationID/lock
 */
export const acquireLock = asynchandler(async (req, res) => {
	const { consultationID } = req.params;

	const consultation = await ConsultationModel.findById(consultationID);
	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	// if no lock then grant lock
	if (!consultation.lock?.lockedBy) {
		consultation.lock = {
			lockedBy: req.user._id,
			lockedAt: new Date(),
		};
		await consultation.save();
		res.json({ locked: true, owner: true });
		return;
	}

	// if lock exists and user owns it then still owner
	if (consultation.lock.lockedBy.toString() === req.user._id.toString()) {
		res.json({ locked: true, owner: true });
		return;
	}

	// expired lock then grant lock
	if (
		consultation.lock?.lockedAt &&
		new Date().getTime() - consultation.lock.lockedAt.getTime() > ONE_MINUTE_MS
	) {
		consultation.lock = { lockedBy: req.user._id, lockedAt: new Date() };
		await consultation.save();
		res.json({ locked: true, owner: true });
		return;
	}

	// Someone else owns lock
	res.json({ locked: true, owner: false });
	return;
});

/**
 * @route GET /api/v1/consultation/report
 * @query instructorId
 * @query startDate
 * @query endDate
 * @query status (optional)
 */
export const getConsultationReport = asynchandler(async (req, res) => {
	const { instructorId, status, startDate, endDate } = req.query;

	if (!instructorId || !startDate || !endDate) {
		res
			.status(BAD_REQUEST)
			.json(
				new CustomResponse(false, null, 'Missing instructorId or date range')
			);
		return;
	}

	const match: any = {
		instructor: new Types.ObjectId(instructorId as string),
		scheduledAt: {
			$gte: new Date(startDate as string),
			$lte: new Date(endDate as string),
		},
	};

	if (status && typeof status === 'string') {
		match.status = status;
	}

	console.log('getConsultationReport match:', match);

	const consultations = await ConsultationModel.find(match)
		.select('title purpose subjectCode sectonCode status scheduledAt')
		.lean();

	const decrypted = consultations.map((c) =>
		decryptFields(c, consultatioModelEncryptedFields)
	);

	res.json(
		new CustomResponse(true, decrypted, 'Consultation report data fetched')
	);
});

/**
 * @route GET /api/v1/consultation/report
 * @query instructorId
 * @query startDate
 * @query endDate
 * @query status (optional)
 */
export const getConsultationReport = asynchandler(async (req, res) => {
	const { instructorId, status, startDate, endDate } = req.query;

	if (!instructorId || !startDate || !endDate) {
		res
			.status(BAD_REQUEST)
			.json(
				new CustomResponse(false, null, 'Missing instructorId or date range')
			);
		return;
	}

	const match: any = {
		instructor: new Types.ObjectId(instructorId as string),
		scheduledAt: {
			$gte: new Date(startDate as string),
			$lte: new Date(endDate as string),
		},
	};

	if (status && typeof status === 'string') {
		match.status = status;
	}

	console.log('getConsultationReport match:', match);

	const consultations = await ConsultationModel.find(match)
		.select('title purpose subjectCode sectonCode status scheduledAt')
		.lean();

	const decrypted = consultations.map((c) =>
		decryptFields(c, consultatioModelEncryptedFields)
	);

	res.json(
		new CustomResponse(true, decrypted, 'Consultation report data fetched')
	);
});
