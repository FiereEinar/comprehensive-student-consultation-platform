import asyncHandler from 'express-async-handler';
import UserModel from '../models/user.model';
import CustomResponse from '../utils/response';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from '../constants/http';
import { DEFAULT_LIMIT, RESOURCE_TYPES } from '../constants';
import { updateUserPasswordSchema } from '../schemas/user.schema';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT } from '../constants/env';
import { logActivity } from '../utils/activity-logger';

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

/**
 * @route PATCH /api/v1/user/:userID/name
 */
export const updateUserName = asyncHandler(async (req, res) => {
	const { name } = req.body;
	const { userID } = req.params;

	await logActivity(req, {
		action: 'UPDATE_USER',
		description: 'Update user name',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	appAssert(name, BAD_REQUEST, 'Name is required.');

	appAssert(
		req.user._id.toString() === userID,
		UNAUTHORIZED,
		'You are not authorized to update this account'
	);

	const user = await UserModel.findByIdAndUpdate(
		userID,
		{ name },
		{ new: true }
	);
	appAssert(user, NOT_FOUND, 'User not found.');

	res.json(
		new CustomResponse(
			true,
			user.omitPassword(),
			'User name updated successfully!'
		)
	);
});

/**
 * @route PATCH /api/v1/user/:userID/passsord
 */
export const updateUserPassword = asyncHandler(async (req, res) => {
	const body = updateUserPasswordSchema.parse(req.body);
	const { userID } = req.params;

	await logActivity(req, {
		action: 'UPDATE_USER',
		description: 'Update user password',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	appAssert(
		req.user._id.toString() === userID,
		UNAUTHORIZED,
		'You are not authorized to update this account'
	);

	const user = await UserModel.findById(userID);
	appAssert(user, NOT_FOUND, 'User not found');

	const isMatch = await bcrypt.compare(body.currentPassword, user.password);
	appAssert(isMatch, BAD_REQUEST, 'Current password is incorrect');

	user.password = await bcrypt.hash(body.newPassword, parseInt(BCRYPT_SALT));
	await user.save();

	res.json(new CustomResponse(true, null, 'Password updated successfully'));
});
