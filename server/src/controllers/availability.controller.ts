import asyncHandler from 'express-async-handler';
import { createAvilabilitySchema } from '../schemas/availability.schema';
import UserModel from '../models/user.model';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import CustomResponse from '../utils/response';
import { logActivity } from '../utils/activity-logger';
import { RESOURCE_TYPES } from '../constants';

/**
 * @route GET /api/v1/user/:userID/availability
 */
export const getInstructorAvailability = asyncHandler(async (req, res) => {
	const { userID } = req.query;

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

// /**
//  * @route PUT /api/v1/user/:userID/availability
//  */
// export const updateInstructorAvailability = asyncHandler(async (req, res) => {
// 	const { userID } = req.params;
// 	const { day, startTime, endTime, slots } = createAvilabilitySchema.parse(
// 		req.body
// 	);

// 	const instructor = await UserModel.findById(userID);
// 	appAssert(instructor, NOT_FOUND, 'Instructor not found');
// 	appAssert(
// 		instructor.role === 'instructor',
// 		BAD_REQUEST,
// 		'User is not an instructor'
// 	);

// 	const availability = await AvailabilityModel.findOne({
// 		user: instructor._id,
// 		day: day,
// 	});

// 	if (availability) {
// 		availability.startTime = startTime;
// 		availability.endTime = endTime;
// 		availability.slots = parseInt(slots);
// 		await availability.save();
// 	} else {
// 		await AvailabilityModel.create({
// 			user: instructor._id,
// 			day: day,
// 			startTime: startTime,
// 			endTime: endTime,
// 			slots: slots,
// 		});
// 	}

// 	await logActivity(req, {
// 		action: 'UPDATE_AVAILABILITY',
// 		description: 'Updated availability',
// 		resourceId: instructor._id as unknown as string,
// 		resourceType: RESOURCE_TYPES.USER,
// 	});

// 	res.json(new CustomResponse(true, availability, 'Availability updated'));
// });

/**
 * @route PUT /api/v1/availability/:availabilityID
 */
export const updateSingleAvailability = asyncHandler(async (req, res) => {
	const { availabilityID } = req.params;
	const updateFields = req.body;

	const instructor = await UserModel.findById(req.user._id);
	appAssert(instructor, NOT_FOUND, 'Instructor not found');
	appAssert(
		instructor.role === 'instructor',
		BAD_REQUEST,
		'User is not an instructor'
	);

	// Find the record
	const availability = await AvailabilityModel.findById(availabilityID);
	appAssert(availability, NOT_FOUND, 'Availability not found');

	// Ensure all fields (even falsy like slots=0) are updated
	if (Object.prototype.hasOwnProperty.call(updateFields, 'day'))
		availability.day = updateFields.day;
	if (Object.prototype.hasOwnProperty.call(updateFields, 'startTime'))
		availability.startTime = updateFields.startTime;
	if (Object.prototype.hasOwnProperty.call(updateFields, 'endTime'))
		availability.endTime = updateFields.endTime;
	if (Object.prototype.hasOwnProperty.call(updateFields, 'slots'))
		availability.slots = parseInt(updateFields.slots);

	await availability.save();

	await logActivity(req, {
		action: 'UPDATE_AVAILABILITY',
		description: 'Updated availability',
		resourceId: instructor._id as unknown as string,
		resourceType: RESOURCE_TYPES.USER,
	});

	res.json(new CustomResponse(true, availability, 'Availability updated'));
});

export const createInstructorAvailability = asyncHandler(async (req, res) => {
	const { day, startTime, endTime, slots, userID } =
		createAvilabilitySchema.parse(req.body);

	const instructor = await UserModel.findById(req.user._id);
	appAssert(instructor, NOT_FOUND, 'Instructor not found');
	appAssert(
		instructor.role === 'instructor',
		BAD_REQUEST,
		'User is not an instructor'
	);

	// Create new availability (MongoDB auto-generates _id and __v)
	const newAvailability = AvailabilityModel.create({
		user: userID,
		day,
		startTime,
		endTime,
		slots,
	});

	await logActivity(req, {
		action: 'CREATE_AVAILABILITY',
		description: 'Instructor created availability',
		resourceId: instructor._id as unknown as string,
		resourceType: RESOURCE_TYPES.USER,
	});

	res
		.status(201)
		.json(new CustomResponse(true, newAvailability, 'Availability created'));
});

export const deleteSingleAvailability = asyncHandler(async (req, res) => {
	const { availabilityID } = req.params;

	const instructor = await UserModel.findById(req.user._id);
	appAssert(instructor, NOT_FOUND, 'Instructor not found');
	appAssert(
		instructor.role === 'instructor',
		BAD_REQUEST,
		'User is not an instructor'
	);

	const result = await AvailabilityModel.findByIdAndDelete(availabilityID);
	appAssert(result, NOT_FOUND, 'Availability not found');

	await logActivity(req, {
		action: 'DELETE_AVAILABILITY',
		description: 'Instructor deleted availability',
		resourceId: instructor._id as unknown as string,
		resourceType: RESOURCE_TYPES.USER,
	});

	res.json(new CustomResponse(true, result, 'Availability deleted'));
});
