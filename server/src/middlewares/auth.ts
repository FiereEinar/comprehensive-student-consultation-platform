import asyncHandler from 'express-async-handler';
import { NextFunction, RequestHandler, Response } from 'express';
import { getAccessToken, verifyToken } from '../utils/jwts';
import appAssert from '../errors/app-assert';
import { FORBIDDEN, UNAUTHORIZED } from '../constants/http';
import { AppErrorCodes } from '../constants';
import UserModel, { UserTypes } from '../models/user.model';
import SessionModel from '../models/session.model';
import { getUserRequestInfo } from '../utils/utils';

export const auth = asyncHandler(
	async (req, res: Response, next: NextFunction) => {
		const token = getAccessToken(req);
		appAssert(
			token,
			UNAUTHORIZED,
			'No token found',
			AppErrorCodes.InvalidAccessToken
		);

		const { error, payload } = verifyToken(token);
		appAssert(
			!error && payload,
			UNAUTHORIZED,
			'Token not verified',
			AppErrorCodes.InvalidAccessToken
		);

		const user = await UserModel.findById(payload.userID as string).populate(
			'roles'
		);
		appAssert(
			user,
			UNAUTHORIZED,
			'User not found',
			AppErrorCodes.InvalidAccessToken
		);

		const session = await SessionModel.findById(payload.sessionID);
		appAssert(
			session,
			UNAUTHORIZED,
			'Session not found',
			AppErrorCodes.InvalidAccessToken
		);

		const now = Date.now();
		if (session.expiresAt.getTime() < now) {
			await SessionModel.findByIdAndDelete(session._id);
			appAssert(
				false,
				UNAUTHORIZED,
				'Session expired',
				AppErrorCodes.InvalidAccessToken
			);
		}

		const { ip, userAgent } = getUserRequestInfo(req);
		appAssert(
			ip === session.ip && userAgent === session.userAgent,
			UNAUTHORIZED,
			'Invalid session',
			AppErrorCodes.InvalidAccessToken
		);

		req.user = user;
		next();
	}
);

export const authorizeRoles =
	(...roles: UserTypes[]): RequestHandler =>
	(req, res, next) => {
		const user = req.user;

		if (!user) {
			res.sendStatus(UNAUTHORIZED);
			return;
		}

		if (!roles.includes(user.role as UserTypes)) {
			res.sendStatus(FORBIDDEN);
			return;
		}

		next();
	};
