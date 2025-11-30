import asyncHandler from 'express-async-handler';
import { UNAUTHORIZED } from '../constants/http';
import appAssert from '../errors/app-assert';
import UserModel from '../models/user.model';
import { Modules } from '../constants';

export const hasRole = (requiredPermissions: Modules[]) => {
	return asyncHandler(async (req, res, next) => {
		const userId = req.user?._id;
		appAssert(userId, UNAUTHORIZED, 'User not authenticated');

		// Populate user's roles with permissions
		const user = await UserModel.findById(userId).populate({
			path: 'adminRole',
			select: 'permissions',
		});

		appAssert(user, UNAUTHORIZED, 'User not found');

		if (user.role !== 'admin') return next();

		appAssert(user.adminRole, UNAUTHORIZED, 'User does not have an admin role');

		// Collect all permissions from user's roles
		const userPermissions: string[] = [];
		const adminRole = user.adminRole as any;
		if (adminRole && adminRole.permissions) {
			adminRole.permissions.forEach((permission: string) => {
				userPermissions.push(permission);
			});
		}

		// Check if user has any of the required permissions
		const hasPermission = requiredPermissions.some((permission) =>
			userPermissions.includes(permission)
		);

		appAssert(hasPermission, UNAUTHORIZED, 'Insufficient permissions');

		next();
	});
};
