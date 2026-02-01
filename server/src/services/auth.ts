import { Request, Response } from 'express';
import { getUserRequestInfo } from '../utils/utils';
import SessionModel from '../models/session.model';
import { thirtyDaysFromNow } from '../utils/date';
import { refreshTokenSignOptions, signToken } from '../utils/jwts';
import { setAuthCookie } from '../utils/cookie';
import UserModel, { IUser, UserTypes } from '../models/user.model';
import NotificationSettingsModel, {
	defaultNotificationSettings,
} from '../models/notification-settings';
import { BCRYPT_SALT } from '../constants/env';
import bcrypt from 'bcryptjs';
import ConsultationPurposeModel from '../models/consultation-purpose';
import { DEFAULT_CONSULTATION_PURPOSES } from '../constants';

export const loginService = async (
	req: Request,
	res: Response,
	user: IUser,
) => {
	try {
		const { ip, userAgent } = getUserRequestInfo(req);
		const userID = user._id as unknown as string;

		// Create session
		const session = await SessionModel.create({
			userID: userID,
			expiresAt: thirtyDaysFromNow(),
			ip,
			userAgent,
		});

		// sign tokens
		const sessionID = session._id as unknown as string;
		const accessToken = signToken({ sessionID, userID });
		const refreshToken = signToken({ sessionID }, refreshTokenSignOptions);
		setAuthCookie({ res, accessToken, refreshToken });

		req.user = user;
		return accessToken;
	} catch (error: any) {
		throw new Error('Login service failed: ' + error.message);
	}
};

type SignupData = {
	name: string;
	email: string;
	institutionalID: string;
	password: string; // unhashed password
	role?: UserTypes;
	googleID?: string;
	profilePicture?: string;
	googleCalendarTokens?: any;
};

export const signupService = async (signupData: SignupData) => {
	try {
		const hashedPassword = await bcrypt.hash(
			signupData.password,
			parseInt(BCRYPT_SALT),
		);
		signupData.password = hashedPassword;

		const user = await UserModel.create(signupData);

		await NotificationSettingsModel.create({
			user: user._id as unknown as string,
			...defaultNotificationSettings,
		});

		if (signupData.role === 'instructor') {
			await ConsultationPurposeModel.create({
				purposes: DEFAULT_CONSULTATION_PURPOSES,
				createdBy: user._id as unknown as string,
			});
		}

		return user;
	} catch (error: any) {
		throw new Error('Signup service failed: ' + error.message);
	}
};
