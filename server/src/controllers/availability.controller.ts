import asycHandler from 'express-async-handler';
import { createAvilabilitySchema } from '../schemas/availability.schema';
import UserModel from '../models/user.model';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND } from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import CustomResponse from '../utils/response';

/**
 * @route PUT /api/v1/user/:userID/availability
 */
export const updateInstructorAvailability = asycHandler(async (req, res) => {
	const { userID } = req.params;
	const { day, startTime, endTime, slots } = createAvilabilitySchema.parse(
		req.body
	);

	const instructor = await UserModel.findById(userID);
	appAssert(instructor, NOT_FOUND, 'Instructor not found');
	appAssert(
		instructor.role === 'instructor',
		BAD_REQUEST,
		'User is not an instructor'
	);

	const availability = await AvailabilityModel.findOne({
		user: instructor._id,
		day: day,
	});

	if (availability) {
		availability.startTime = startTime;
		availability.endTime = endTime;
		availability.slots = parseInt(slots);
		await availability.save();
	} else {
		await AvailabilityModel.create({
			user: instructor._id,
			day: day,
			startTime: startTime,
			endTime: endTime,
			slots: slots,
		});
	}

	res.json(new CustomResponse(true, availability, 'Availability updated'));
});

/**
 * @route GET /api/v1/user/:userID/availability
 */
export const getInstructorAvailability = asycHandler(async (req, res) => {
	const { userID } = req.params;

	const instructor = await UserModel.findById(userID);
	appAssert(instructor, NOT_FOUND, 'Instructor not found');
	appAssert(
		instructor.role === 'instructor',
		BAD_REQUEST,
		'User is not an instructor'
	);

	const availabilities = await AvailabilityModel.find({
		user: instructor._id,
	});

	res.json(new CustomResponse(true, availabilities, 'Availability fetched'));
});
