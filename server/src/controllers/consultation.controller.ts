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
import {
	BAD_REQUEST,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	UNAUTHORIZED,
} from '../constants/http';
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
import { createGoogleMeetLink } from '../utils/google-meet';
import { createCalendarEvent } from '../utils/google-calendar';
import { sendConsultationEmail } from '../utils/consultation-email';

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

	// if student already has a consultation for this day then reject
	const existingConsultation = await ConsultationModel.findOne({
		student: student._id,
		scheduledAt: { $gte: startOfDay, $lte: endOfDay },
		status: { $nin: ['cancelled', 'declined'] },
	});
	appAssert(
		!existingConsultation,
		BAD_REQUEST,
		'Student already has a consultation for this day'
	);
	const consultation = await ConsultationModel.create(body);

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
		.sort({ createdAt: -1 })
		.exec();

	res.json(new CustomResponse(true, consultations, 'Consultations fetched'));
});

/**
 * @route PATCH /api/v1/consultation/:consultationID
 */
export const updateConsultationStatus = asynchandler(async (req, res) => {
	const currentUser = req.user;
	const { consultationID } = req.params;
	const status = consutationStatusSchema.parse(req.body.status);

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

	const { student, instructor } = consultation;

	consultation.status = status;
	await consultation.save();

	try {
		const message = {
			from: `"Consultation Admin" <${EMAIL_USER}>`,
			to: student.email,
			subject: `Consultation ${
				status === 'accepted'
					? 'Accepted'
					: status === 'declined'
					? 'Declined'
					: status === 'completed'
					? 'Completed'
					: 'Updated'
			}`,
			html: `
        <div style="font-family:sans-serif;padding:1rem;border-radius:8px;background:#f9fafb;">
          <h2 style="color:#111;">Consultation Status Update</h2>
          <p>Hello ${student.name},</p>
          <p>Your consultation with <b>${
						instructor.name
					}</b> has been <b>${status}</b>.</p>
          ${
						status === 'accepted' && consultation.meetLink
							? `<p>You can join using this link:</p>
               <a href="${consultation.meetLink}" 
                  style="display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#111;color:#fff;border-radius:6px;text-decoration:none;">
                  Join Google Meet
               </a>`
							: ''
					}
          <p style="margin-top:1rem;font-size:12px;color:#555;">
            This is an automated notification from the Consultation System.
          </p>
        </div>
      `,
		};
		await sendMail(message);
	} catch (error) {
		console.error('Failed to send consultation status email:', error);
	}

	// 📅 Manage Google Calendar event based on status
	try {
		const instructorUser = await UserModel.findById(instructor._id);
		if (instructorUser?.googleCalendarTokens) {
			const oAuth2Client = new google.auth.OAuth2(
				GOOGLE_CLIENT_ID,
				GOOGLE_CLIENT_SECRET,
				GOOGLE_REDIRECT_URI
			);
			oAuth2Client.setCredentials(instructorUser.googleCalendarTokens);
			const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

			if (status === 'accepted') {
				// ✅ Create event if accepted
				const event = {
					summary: `Consultation with ${student.name}`,
					description: consultation.description || 'Consultation meeting',
					start: {
						dateTime: consultation.scheduledAt.toISOString(),
						timeZone: 'Asia/Manila',
					},
					end: {
						dateTime: new Date(
							new Date(consultation.scheduledAt).getTime() + 60 * 60 * 1000
						).toISOString(),
						timeZone: 'Asia/Manila',
					},
					conferenceData: {
						createRequest: {
							requestId: Math.random().toString(36).substring(2, 15),
							conferenceSolutionKey: { type: 'hangoutsMeet' },
						},
					},
					attendees: [{ email: instructor.email }, { email: student.email }],
				};

				const response = await calendar.events.insert({
					calendarId: 'primary',
					requestBody: event,
					conferenceDataVersion: 1,
				});

				const eventId = response.data.id;
				const meetLink = response.data?.conferenceData?.entryPoints?.[0]?.uri;

				if (eventId) consultation.googleCalendarEventId = eventId;
				if (meetLink) consultation.meetLink = meetLink;
				await consultation.save();
			}

			if (status === 'completed' && consultation.googleCalendarEventId) {
				// 🗑 Remove event if completed
				await calendar.events.delete({
					calendarId: 'primary',
					eventId: consultation.googleCalendarEventId,
				});
				consultation.googleCalendarEventId = null;
				await consultation.save();
			}
		}
	} catch (error) {
		console.error('Failed to manage Google Calendar event:', error);
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

	// disabled this because creating a meeting link already creates a calendar event
	// Add to instructor’s calendar if connected
	// const instructorUser = await UserModel.findById(instructor._id);
	// if (instructorUser?.googleCalendarTokens) {
	// 	const instructorAuth = new google.auth.OAuth2(
	// 		GOOGLE_CLIENT_ID,
	// 		GOOGLE_CLIENT_SECRET,
	// 		GOOGLE_REDIRECT_URI
	// 	);
	// 	instructorAuth.setCredentials(instructorUser.googleCalendarTokens);

	// 	await createCalendarEvent(instructorAuth, {
	// 		summary: req.body.summary,
	// 		description: `Consultation meeting with student ${student.name}`,
	// 		startTime: req.body.startTime,
	// 		endTime: req.body.endTime,
	// 		attendees: [{ email: instructor.email }, { email: student.email }],
	// 	});
	// } else {
	// 	console.warn('Instructor does not have Google Calendar connected.');
	// }

	// Send emails
	const recipients = [
		{ name: instructor.name, email: instructor.email },
		{ name: student.name, email: student.email },
	];

	for (const recipient of recipients) {
		await sendConsultationEmail(recipient, {
			student,
			instructor,
			summary: req.body.summary,
			startTime: req.body.startTime,
			endTime: req.body.endTime,
			meetLink,
		});
	}

	res.json({ meetLink });
});
