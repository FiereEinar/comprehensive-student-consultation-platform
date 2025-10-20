import asyncHandler from 'express-async-handler';
import UserModel from '../models/user.model';
import CustomResponse from '../utils/response';
import appAssert from '../errors/app-assert';
import { NOT_FOUND } from '../constants/http';
import { DEFAULT_LIMIT } from '../constants';

/**
 * @route GET /api/v1/user
 * query: role = 'student' | 'instructor' | 'admin'
 * limit: number
 */
export const getUsers = asyncHandler(async (req, res) => {
	const { role, limit } = req.query;

	const filter: any = {};

	if (role) {
		filter.role = role;
	}

	const data = await UserModel.find(filter)
		.limit(Number(limit) ?? DEFAULT_LIMIT)
		.exec();
	const users = data.map((user) => user.omitPassword());

	res.json(new CustomResponse(true, users, 'Users fetched'));
});

/**
 * @route GET /api/v1/user/:userID
 */
export const getSingleUser = asyncHandler(async (req, res) => {
	const { userID } = req.params;

	const data = await UserModel.findById(userID).exec();
	appAssert(data, NOT_FOUND, 'User not found');

	const user = data.omitPassword();

	res.json(new CustomResponse(true, user, 'User fetched'));
});
