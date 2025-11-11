import asyncHandler from 'express-async-handler';
import { createAvilabilitySchema } from '../schemas/availability.schema';
import UserModel from '../models/user.model';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from '../constants/http';
import AvailabilityModel from '../models/availability.model';
import CustomResponse from '../utils/response';
import { logActivity } from '../utils/activity-logger';
import ConsultationModel from '../models/consultation.models';
import { link } from 'fs';

/**
 * @route PUT /api/v1/user/:userID/availability
 */
export const updateInstructorAvailability = asyncHandler(async (req, res) => {
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

export const updateSingleAvailability = asyncHandler(async (req, res) => {
	const { availabilityID } = req.params;
	// Optionally validate with Zod or your custom schema
	const updateFields = req.body;

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

	res.json(new CustomResponse(true, availability, 'Availability updated'));
});

/**
 * @route GET /api/v1/user/:userID/availability
 */
export const getInstructorAvailability = asyncHandler(async (req, res) => {
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

import { Request, Response } from 'express';

export const createInstructorAvailability = async (
	req: Request,
	res: Response
) => {
	try {
		const userID = req.params.userID;
		const { day, startTime, endTime, slots } = req.body;

		// Create new availability (MongoDB auto-generates _id and __v)
		const newAvailability = new AvailabilityModel({
			user: userID,
			day,
			startTime,
			endTime,
			slots,
		});

		await newAvailability.save();

		res.status(201).json({
			message: 'Availability created!',
			data: newAvailability,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error creating availability', error });
	}
};

export const deleteSingleAvailability = asyncHandler(async (req, res) => {
	const { availabilityID } = req.params;
	const result = await AvailabilityModel.findByIdAndDelete(availabilityID);
	appAssert(result, NOT_FOUND, 'Availability not found');
	res.json(new CustomResponse(true, result, 'Availability deleted'));
});
