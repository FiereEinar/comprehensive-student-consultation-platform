import asyncHandler from 'express-async-handler';
import CustomResponse from '../utils/response';
import UserModel from '../models/user.model';

export const getInstructors = asyncHandler(async (req, res) => {
	const instructors = await UserModel.find({ role: 'instructor' }).exec();

	res.json(new CustomResponse(true, instructors, 'Instructors fetched'));
});
