import asyncHandler from 'express-async-handler';
import UserModel, {
	userModelEncryptedFields,
	UserTypes,
} from '../models/user.model';
import CustomResponse, { CustomPaginatedResponse } from '../utils/response';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } from '../constants/http';
import { DEFAULT_LIMIT, RESOURCE_TYPES } from '../constants';
import { updateUserPasswordSchema } from '../schemas/user.schema';
import bcrypt from 'bcryptjs';
import { BCRYPT_SALT } from '../constants/env';
import { logActivity } from '../utils/activity-logger';
import { decryptFields } from '../utils/encryption';
import RoleModel from '../models/role.model';

/**
 * @route GET /api/v1/user
 * @query page=1
 * @query pageSize=10
 * @query search=keyword
 * @query role=admin|student|instructor
 */
export const getUsers = asyncHandler(async (req, res) => {
	const {
		page = 1,
		pageSize = DEFAULT_LIMIT,
		search = '',
		role = '',
	} = req.query as Record<string, string>;

	const numericPage = Number(page);
	const limit = Number(pageSize);
	const skip = (numericPage - 1) * limit;

	/** ---------------------
	 *        FILTERS
	 *  --------------------*/
	const filter: Record<string, any> = {};

	// filter by role (optional)
	if (role.trim() !== '') {
		filter.role = role;
	}

	// search: name, email, institutionalID
	if (search.trim() !== '') {
		const regex = { $regex: search, $options: 'i' };
		filter.$or = [
			{ name: regex },
			{ email: regex },
			{ institutionalID: regex },
		];
	}

	/** ---------------------
	 *     FETCH DATA
	 *  --------------------*/
	const usersRaw = await UserModel.find(filter).skip(skip).limit(limit).exec();

	let users = usersRaw.map((u) => u.omitPassword());
	users = users.map((u) => decryptFields(u, userModelEncryptedFields));

	const total = await UserModel.countDocuments(filter);

	// calculate pagination
	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(true, users, 'Users fetched', next, prev)
	);
});

/**
 * handler made to work with that dumbass IAS requirement "encryption"
 * @route GET /api/v1/user
 * @query page=1
 * @query pageSize=10
 * @query search=keyword (runs on decrypted data)
 * @query role=admin|student|instructor
 */
export const getUsersV2 = asyncHandler(async (req, res) => {
	const {
		page = 1,
		pageSize = DEFAULT_LIMIT,
		search = '',
		role = '',
		fetchAll = false,
	} = req.query as Record<string, string>;

	const numericPage = Number(page);
	const limit = Number(pageSize);
	const skip = (numericPage - 1) * limit;

	/** ----------------------------------------
	 * FETCH ALL USERS FIRST (NO SEARCH FILTER)
	 * ----------------------------------------*/
	const dbFilter: Record<string, any> = {};

	// filter by role (optional)
	if (role.trim() !== '') {
		dbFilter.role = role;
	}

	// fetch all
	const allUsersRaw = await UserModel.find(dbFilter).exec();

	/** ----------------------------------------
	 *  DECRYPT AND CLEAN USER DATA
	 * ----------------------------------------*/
	let users = allUsersRaw.map((u) => {
		const base = u.omitPassword(); // remove password
		return decryptFields(base, userModelEncryptedFields);
	});

	/** ----------------------------------------
	 *  APPLY SEARCH AFTER DECRYPTION
	 * ----------------------------------------*/
	if (search.trim() !== '') {
		const s = search.toLowerCase();

		users = users.filter((u) => {
			return (
				String(u.name || '')
					.toLowerCase()
					.includes(s) ||
				String(u.email || '')
					.toLowerCase()
					.includes(s) ||
				String(u.institutionalID || '')
					.toLowerCase()
					.includes(s)
			);
		});
	}

	/** ----------------------------------------
	 *       PAGINATION (ON FILTERED DATA)
	 * ----------------------------------------*/
	const total = users.length;
	const paginatedUsers = Boolean(fetchAll)
		? users
		: users.slice(skip, skip + limit);

	const next = skip + limit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	res.json(
		new CustomPaginatedResponse(
			true,
			paginatedUsers,
			'Users fetched',
			next,
			prev
		)
	);
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

/**
 * @route PATCH /api/v1/user/:userID/admin
 * @body { name?: string, institutionalID?: string, email?: string, role?: UserTypes, roles?: string[] }
 */
export const updateUserByAdmin = asyncHandler(async (req, res) => {
	const { userID } = req.params;
	const { name, institutionalID, email, role, roles } = req.body;

	await logActivity(req, {
		action: 'UPDATE_USER_BY_ADMIN',
		description: 'Update user by admin',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	const user = await UserModel.findById(userID);
	appAssert(user, NOT_FOUND, 'User not found');

	const updateData: any = {};
	if (name !== undefined) updateData.name = name;
	if (institutionalID !== undefined)
		updateData.institutionalID = institutionalID;
	if (email !== undefined) updateData.email = email;
	if (role !== undefined) updateData.role = role;
	if (roles !== undefined) {
		// Validate roles exist
		const roleDocs = await RoleModel.find({ _id: { $in: roles } });
		appAssert(
			roleDocs.length === roles.length,
			BAD_REQUEST,
			'Invalid roles provided'
		);
		updateData.roles = roles;
	}

	const updatedUser = await UserModel.findByIdAndUpdate(userID, updateData, {
		new: true,
	});
	appAssert(updatedUser, NOT_FOUND, 'User not found after update');

	res.json(
		new CustomResponse(
			true,
			decryptFields(updatedUser.omitPassword(), userModelEncryptedFields),
			'User updated successfully'
		)
	);
});

/**
 * @route PATCH /api/v1/user/:userID/admin/password
 * @body { newPassword: string }
 */
export const updateUserPasswordByAdmin = asyncHandler(async (req, res) => {
	const { userID } = req.params;
	const { newPassword } = req.body;

	await logActivity(req, {
		action: 'UPDATE_USER_PASSWORD_BY_ADMIN',
		description: 'Update user password by admin',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	appAssert(newPassword, BAD_REQUEST, 'New password is required');

	const user = await UserModel.findById(userID);
	appAssert(user, NOT_FOUND, 'User not found');

	user.password = await bcrypt.hash(newPassword, parseInt(BCRYPT_SALT));
	await user.save();

	res.json(new CustomResponse(true, null, 'Password updated successfully'));
});

/**
 * @route PATCH /api/v1/user/:userID/archive
 * @body { archived: boolean }
 */
export const archiveUser = asyncHandler(async (req, res) => {
	const { userID } = req.params;
	const { archived } = req.body;

	await logActivity(req, {
		action: archived ? 'ARCHIVE_USER' : 'UNARCHIVE_USER',
		description: archived ? 'Archive user' : 'Unarchive user',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	const user = await UserModel.findByIdAndUpdate(
		userID,
		{ archived },
		{ new: true }
	);
	appAssert(user, NOT_FOUND, 'User not found');

	res.json(
		new CustomResponse(
			true,
			decryptFields(user.omitPassword(), userModelEncryptedFields),
			`User ${archived ? 'archived' : 'unarchived'} successfully`
		)
	);
});

/**
 * @route GET /api/v1/user/stats
 */
export const getUserStats = asyncHandler(async (req, res) => {
	const [
		totalUsers,
		activeUsers,
		archivedUsers,
		students,
		instructors,
		admins,
	] = await Promise.all([
		UserModel.countDocuments(),
		UserModel.countDocuments({ archived: { $ne: true } }),
		UserModel.countDocuments({ archived: true }),
		UserModel.countDocuments({ role: 'student' }),
		UserModel.countDocuments({ role: 'instructor' }),
		UserModel.countDocuments({ role: 'admin' }),
	]);

	const stats = {
		totalUsers,
		activeUsers,
		archivedUsers,
		students,
		instructors,
		admins,
	};

	res.json(new CustomResponse(true, stats, 'User statistics fetched'));
});
