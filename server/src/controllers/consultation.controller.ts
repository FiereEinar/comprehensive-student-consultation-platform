import asynchandler from 'express-async-handler';
import {
	consutationStatusSchema,
	createConsultationSchema,
} from '../schemas/consultation.schema';
import ConsultationModel, {
	IConsultation,
} from '../models/consultation.models';
import CustomResponse from '../utils/response';
import UserModel from '../models/user.model';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import { getStartAndEndofDay } from '../utils/date';
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

/**
 * @route GET /api/v1/consultation - get all recent consultations
 */
export const getConsultations = asynchandler(async (req, res) => {
	const consultations = await ConsultationModel.find()
		.populate('student')
		.populate('instructor')
		.exec();

	res.json(new CustomResponse(true, consultations, 'Consultations fetched'));
});

/**
 * @route POST /api/v1/consultation - create a consultation
 */
export const createConsultation = asynchandler(async (req, res) => {
	await logActivity(req, {
		action: 'CREATE_CONSULTATION',
		description: 'Created a consultation',
		resourceType: RESOURCE_TYPES.CONSULTATION,
	});

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
		'Instructor has no availability set for this day'
	);

	// check how many consultations the instructor has for this day
	const { startOfDay, endOfDay } = getStartAndEndofDay(consultationDate);
	const existingConsultations = await ConsultationModel.countDocuments({
		instructor: instructor._id,
		scheduledAt: { $gte: startOfDay, $lte: endOfDay },
		status: { $ne: 'cancelled' },
	});

	appAssert(
		existingConsultations < availability.slots,
		BAD_REQUEST,
		'No remaining consultation slots for this day'
	);

	const consultation = await ConsultationModel.create(body);

	res.json(
		new CustomResponse(true, consultation, 'Consultation request created')
	);
});

/**
 * @route GET /api/v1/user/:userID/consultation
 * query: status = 'pending' | 'accepted' | 'declined' | 'completed' - can be joined with comma
 * limit: number
 */
export const getUserConsultations = asynchandler(async (req, res) => {
	const { userID } = req.params;
	const { status, limit } = req.query;

	const filter: any = {
		$or: [{ student: userID }, { instructor: userID }],
	};

	if (status) {
		const statuses = status.toString().split(',');
		filter.status = status;
		if (statuses.length > 0) filter.status = { $in: statuses };
	}

	const consultations = await ConsultationModel.find(filter)
		.populate('student')
		.populate('instructor')
		.limit(Number(limit) ?? DEFAULT_LIMIT)
		.exec();

	res.json(new CustomResponse(true, consultations, 'Consultations fetched'));
});

/**
 * @route PATCH /api/v1/consultation/:consultationID
 */
export const updateConsultationStatus = asynchandler(async (req, res) => {
	const currentUser = req.user;
	const { consultationID } = req.params;

	await logActivity(req, {
		action: 'UPDATE_CONSULTATION',
		description: 'Updated a consultation',
		resourceId: consultationID,
		resourceType: RESOURCE_TYPES.CONSULTATION,
	});

	const status = consutationStatusSchema.parse(req.body.status);

	const consultation = await ConsultationModel.findById(consultationID);
	appAssert(consultation, NOT_FOUND, 'Consultation not found');

	appAssert(
		currentUser.role === 'instructor',
		BAD_REQUEST,
		'Only instructors can update consultation status'
	);

	consultation.status = status;
	await consultation.save();

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

	// get active instructors (instructors with upcoming or ongoing consultations) ===
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
	const userId = req.session!.userID;
	const user = await UserModel.findById(userId);
	if (!user || !user.googleCalendarTokens) {
		res.status(401).json({ error: 'Google Calendar not connected' });
		return;
	}

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
	const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

	try {
		const event = {
			summary: req.body.summary || 'Consultation Meeting',
			description:
				req.body.description || 'Consultation meeting via Google Meet',
			start: { dateTime: req.body.startTime, timeZone: 'Asia/Manila' },
			end: { dateTime: req.body.endTime, timeZone: 'Asia/Manila' },
			conferenceData: {
				createRequest: {
					requestId: Math.random().toString(36).substring(2, 15),
					conferenceSolutionKey: { type: 'hangoutsMeet' },
				},
			},
		};

		const response = await calendar.events.insert({
			calendarId: 'primary',
			requestBody: event,
			conferenceDataVersion: 1,
		});

		const meetLink = response.data?.conferenceData?.entryPoints?.[0]?.uri;
		appAssert(meetLink, 500, 'Failed to generate Google Meet link');

		//  ADDED: Create event on the INSTRUCTOR's Google Calendar
		const instructorUser = await UserModel.findById(instructor._id); // ADDED
		if (instructorUser?.googleCalendarTokens) {
			// ADDED
			const instructorAuth = new google.auth.OAuth2( // ADDED
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				GOOGLE_REDIRECT_URI
			);
			instructorAuth.setCredentials(instructorUser.googleCalendarTokens); // ADDED

			const instructorCalendar = google.calendar({
				version: 'v3',
				auth: instructorAuth,
			}); // ADDED

			await instructorCalendar.events.insert({
				// ADDED
				calendarId: 'primary',
				requestBody: {
					summary: req.body.summary || 'Consultation Meeting',
					description:
						req.body.description ||
						`Consultation meeting with student ${student.name}.`,
					start: { dateTime: req.body.startTime, timeZone: 'Asia/Manila' },
					end: { dateTime: req.body.endTime, timeZone: 'Asia/Manila' },
					conferenceData: {
						createRequest: {
							requestId: Math.random().toString(36).substring(2, 15),
							conferenceSolutionKey: { type: 'hangoutsMeet' },
						},
					},
					attendees: [{ email: instructor.email }, { email: student.email }],
				},
				conferenceDataVersion: 1,
			});
		} else {
			console.warn('Instructor does not have Google Calendar connected.'); // ADDED
		}
		// END ADDITION

		const recipients = [
			{ name: instructor.name, email: instructor.email, role: 'Instructor' },
			{ name: student.name, email: student.email, role: 'Student' },
		];

		for (const recipient of recipients) {
			const message = {
				from: `"Consultation Admin" <${EMAIL_USER}>`,
				to: recipient.email,
				subject: 'Consultation Meeting Scheduled',
				html: `
          <div style="font-family:sans-serif;padding:1rem;border-radius:8px;background:#f9fafb;">
            <h2 style="color:#111;">Consultation Meeting Scheduled</h2>
            <p>Hello ${recipient.name || ''},</p>
            <p>
              A consultation meeting has been scheduled between <b>${
								student.name
							}</b> 
              and <b>${instructor.name}</b>.
            </p>
            <p><b>Summary:</b> ${req.body.summary || 'Consultation Meeting'}</p>
            <p><b>Start:</b> ${new Date(req.body.startTime).toLocaleString(
							'en-PH',
							{ timeZone: 'Asia/Manila' }
						)}</p>
            <p><b>End:</b> ${new Date(req.body.endTime).toLocaleString(
							'en-PH',
							{ timeZone: 'Asia/Manila' }
						)}</p>
            <a href="${meetLink}" 
               style="display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#111;color:#fff;border-radius:6px;text-decoration:none;">
               Join Google Meet
            </a>
            <p style="margin-top:1rem;font-size:12px;color:#555;">Please join on time. Meeting link is unique for this consultation.</p>
          </div>
        `,
			};

			await sendMail(message);
		}

		res.json({ meetLink });
	} catch (err) {
		console.error(err);
		res.status(500).send('Failed to create meeting');
	}
});
