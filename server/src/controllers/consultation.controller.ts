import asynchandler from 'express-async-handler';
import {
	consutationStatusSchema,
	createConsultationSchema,
} from '../schemas/consultation.schema';
import ConsultationModel, {
	ConsultationStatus,
} from '../models/consultation.models';
import CustomResponse from '../utils/response';
import UserModel from '../models/user.model';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import { getStartAndEndofDay } from '../utils/date';
import { DEFAULT_LIMIT } from '../constants';
import { subDays } from 'date-fns';

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
 * query: status = 'pending' | 'accepted' | 'declined' | 'completed'
 * limit: number
 */
export const getUserConsultations = asynchandler(async (req, res) => {
	const { userID } = req.params;
	const { status, limit } = req.query;

	const filter: any = {
		$or: [{ student: userID }, { instructor: userID }],
	};

	if (status) {
		filter.status = status;
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
