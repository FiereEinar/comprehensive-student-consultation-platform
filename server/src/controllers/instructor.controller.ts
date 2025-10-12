import asyncHandler from 'express-async-handler';
import CustomResponse from '../utils/response';
import UserModel from '../models/user.model';

/**
 * @route GET /api/v1/instructor
 */
export const getInstructors = asyncHandler(async (req, res) => {
	const instructors = await UserModel.find({ role: 'instructor' }).exec();

	res.json(new CustomResponse(true, instructors, 'Instructors fetched'));
});

/**
 * @route POST /api/v1/instructor/:instructorID/availability
 */
// export const setInstructorAvailability = asyncHandler(async (req, res) => {
// 	const { instructorID } = req.params;
// 	const { day, startTime, endTime } = req.body;
// });
