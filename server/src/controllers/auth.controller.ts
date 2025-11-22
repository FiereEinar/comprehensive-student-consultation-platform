import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { createUserSchema, loginSchema } from '../schemas/user.schema';
import appAssert from '../errors/app-assert';
import {
	BAD_REQUEST,
	CONFLICT,
	NO_CONTENT,
	OK,
	UNAUTHORIZED,
} from '../constants/http';
import {
	ACCESS_TOKEN_COOKIE_NAME,
	REFRESH_TOKEN_COOKIE_NAME,
	BCRYPT_SALT,
	JWT_REFRESH_SECRET_KEY,
	GOOGLE_CLIENT_ID,
	FRONTEND_URL,
	EMAIL_USER,
	EMAIL_PASS,
} from '../constants/env';
import SessionModel from '../models/session.model';
import UserModel, { IUser } from '../models/user.model';
import {
	generateCypto,
	getPasswordResetEmailTemplate,
	getUserRequestInfo,
	hashCrypto,
} from '../utils/utils';
import {
	ONE_DAY_FROM_NOW,
	ONE_DAY_MS,
	ONE_HOUR_FROM_NOW,
	thirtyDaysFromNow,
} from '../utils/date';
import {
	getAccessToken,
	RefreshTokenPayload,
	refreshTokenSignOptions,
	signToken,
	verifyToken,
} from '../utils/jwts';
import {
	cookieOptions,
	getAccessTokenOptions,
	getRefreshTokenOptions,
	REFRESH_PATH,
	setAuthCookie,
} from '../utils/cookie';
import CustomResponse from '../utils/response';
import {
	AppErrorCodes,
	RESOURCE_TYPES,
	WHITELISTED_DOMAINS,
} from '../constants';
import { verifyRecaptcha } from '../utils/recaptcha';
import { googleClient } from '../utils/google';
import axios from 'axios';
import InvitationModel from '../models/invitation.model';
import { sendMail } from '../utils/email';
import { logActivity } from '../utils/activity-logger';
import { oAuth2Client } from '../utils/google-client';

/**
 * @route POST /api/v1/auth/login - Login
 */
export const loginHandler = asyncHandler(async (req, res) => {
	const body = loginSchema.parse(req.body);
	const user = await UserModel.findOne({ email: body.email }).exec();

	// Check if user exists
	appAssert(user, UNAUTHORIZED, 'Incorrect email or password');

	// Check password
	const match = await bcrypt.compare(body.password, user.password);
	appAssert(match, UNAUTHORIZED, 'Incorrect email or password');

	const { ip, userAgent } = getUserRequestInfo(req);

	// Create session
	const session = await SessionModel.create({
		userID: user._id,
		expiresAt: thirtyDaysFromNow(),
		ip,
		userAgent,
	});

	const userID = user._id as string;
	const sessionID = session._id as string;

	// sign tokens
	const accessToken = signToken({ sessionID, userID });
	const refreshToken = signToken({ sessionID }, refreshTokenSignOptions);
	setAuthCookie({ res, accessToken, refreshToken });

	await logActivity(req, {
		action: 'USER_LOGIN',
		description: 'User logged in',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	res.json(new CustomResponse(true, user.omitPassword(), 'Login successful'));
});

/**
 * @route POST /api/v1/auth/signup - Sign up
 */
export const signupHandler = asyncHandler(async (req, res) => {
	const body = createUserSchema.parse(req.body);

	// check for duplicate email
	const existingUser = await UserModel.findOne({ email: body.email });
	appAssert(!existingUser, CONFLICT, 'Email already used');

	const sameInstitutionalID = await UserModel.findOne({
		institutionalID: body.institutionalID,
	});
	appAssert(!sameInstitutionalID, CONFLICT, 'Institutional ID already used');

	// Check if passwords match
	appAssert(
		body.password === body.confirmPassword,
		BAD_REQUEST,
		'Passwords do not match'
	);

	// Hash password
	const hashedPassword = await bcrypt.hash(
		body.password,
		parseInt(BCRYPT_SALT)
	);
	body.password = hashedPassword;

	// create user
	const user = await UserModel.create(body);
	await logActivity(req, {
		action: 'USER_SIGNUP',
		description: 'User sign up',
		resourceId: user._id as string,
		resourceType: RESOURCE_TYPES.USER,
	});
	res.json(new CustomResponse(true, user.omitPassword(), 'Signup successful'));
});

/**
 * @route GET /api/v1/auth/logout - Logout
 */
export const logoutHandler = asyncHandler(async (req, res) => {
	await logActivity(req, {
		action: 'USER_LOGOUT',
		description: 'User logged out',
		resourceType: RESOURCE_TYPES.USER,
	});

	const accessToken = getAccessToken(req);

	// check if token is present
	appAssert(accessToken, NO_CONTENT, 'No token');

	const { payload } = verifyToken(accessToken);

	if (payload) {
		await SessionModel.findByIdAndDelete(payload.sessionID);
	}

	// clear the cookie
	res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, cookieOptions);
	res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
		...cookieOptions,
		path: REFRESH_PATH,
	});

	res.sendStatus(OK);
});

/**
 * @route GET /api/v1/auth/refresh - Refresh token
 */
export const refreshTokenHandler = asyncHandler(async (req, res) => {
	// get the refresh token
	const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as string;
	appAssert(refreshToken, UNAUTHORIZED, 'No refresh token found');

	// verify the refresh token
	const { payload } = verifyToken<RefreshTokenPayload>(refreshToken, {
		secret: JWT_REFRESH_SECRET_KEY,
	});

	appAssert(payload, UNAUTHORIZED, 'Token did not return any payload');

	const session = await SessionModel.findById(payload.sessionID);
	const now = Date.now();

	// check if session is valid
	appAssert(session, UNAUTHORIZED, 'Invalid session');

	// check if session is expired
	if (session.expiresAt.getTime() < now) {
		await SessionModel.findByIdAndDelete(session._id);
		appAssert(false, UNAUTHORIZED, 'Session expired');
	}

	// check if session needs refresh
	const sessionNeedsRefresh = session.expiresAt.getTime() - now < ONE_DAY_MS;
	if (sessionNeedsRefresh) {
		session.expiresAt = thirtyDaysFromNow();
		await session.save();
	}

	// create and set the new access token and refresh token
	const newRefreshToken = sessionNeedsRefresh
		? signToken({ sessionID: session._id as string }, refreshTokenSignOptions)
		: undefined;

	const accessToken = signToken({
		sessionID: session._id as string,
		userID: session.userID as unknown as string,
	});

	if (newRefreshToken) {
		res.cookie(
			REFRESH_TOKEN_COOKIE_NAME,
			newRefreshToken,
			getRefreshTokenOptions()
		);
	}

	res
		.status(OK)
		.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, getAccessTokenOptions())
		.json(new CustomResponse(true, null, 'Token refreshed'));
});

/**
 * @route POST /api/v1/token/verify
 */
export const verifyAuthHandler = asyncHandler(async (req, res) => {
	const token = getAccessToken(req);
	appAssert(
		token,
		UNAUTHORIZED,
		'Token not found',
		AppErrorCodes.InvalidAccessToken
	);

	// verify the token
	const { error, payload } = verifyToken(token);
	appAssert(
		!error && payload,
		UNAUTHORIZED,
		'Token not verified',
		AppErrorCodes.InvalidAccessToken
	);

	const user = await UserModel.findById(payload.userID as string);
	const session = await SessionModel.findById(payload.sessionID);

	appAssert(
		session && user,
		UNAUTHORIZED,
		'User or session not found',
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

	res.status(OK).json(user.omitPassword());
});

/**
 * @route POST /api/v1/auth/recaptcha/verify
 */
export const recaptchaVerify = asyncHandler(async (req, res) => {
	const { recaptchaToken } = req.body;

	const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
	appAssert(isRecaptchaValid, BAD_REQUEST, 'Invalid recaptcha token');

	res.status(OK).json(new CustomResponse(true, null, 'Recaptcha verified'));
});

/**
 * @route POST /api/v1/auth/google
 */
export const googleLoginHandler = asyncHandler(async (req, res) => {
	const { token } = req.body;
	appAssert(token, UNAUTHORIZED, 'No token found');

	// Verify Google token
	const ticket = await googleClient.verifyIdToken({
		idToken: token,
		audience: GOOGLE_CLIENT_ID,
	});

	const payload = ticket.getPayload();
	appAssert(payload, UNAUTHORIZED, 'Invalid Google token');

	const { email, name, sub: googleID } = payload;

	// Check if user exists
	let user = await UserModel.findOne({ email });
	if (!user) {
		const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
		user = await UserModel.create({
			name,
			email,
			googleID,
			institutionalID: email?.split('@')[0],
			password: randomPassword,
		});
	}

	// Create session
	const { ip, userAgent } = getUserRequestInfo(req);
	const userID = user._id as string;

	const session = await SessionModel.create({
		userID,
		ip,
		userAgent,
		expiresAt: thirtyDaysFromNow(),
	});

	// Create JWT tokens
	const sessionID = session._id as string;
	const accessToken = signToken({ sessionID, userID });
	const refreshToken = signToken({ sessionID }, refreshTokenSignOptions);
	setAuthCookie({ res, accessToken, refreshToken });

	await logActivity(req, {
		action: 'USER_LOGIN',
		description: 'User logged in via Google',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	res.json({ accessToken, user, message: 'Login successful' });
});

/**
 * @route POST /api/v1/auth/google
 */
export const googleLoginHandlerV2 = asyncHandler(async (req, res) => {
	const { token } = req.body;
	appAssert(token, UNAUTHORIZED, 'No token found');

	const { data: googleUser } = await axios.get(
		'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);

	const { email, name, id: googleID, picture, hd } = googleUser;

	// Check if user exists
	let user = await UserModel.findOne({ email });
	if (!user) {
		appAssert(
			WHITELISTED_DOMAINS.includes(hd),
			UNAUTHORIZED,
			'User is not from a whitelisted domain'
		);

		const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
		user = await UserModel.create({
			name,
			email,
			googleID,
			institutionalID: email?.split('@')[0],
			password: randomPassword,
			profilePicture: picture,
		});
	}

	// Create session
	const { ip, userAgent } = getUserRequestInfo(req);
	const userID = user._id as string;

	const session = await SessionModel.create({
		userID,
		ip,
		userAgent,
		expiresAt: thirtyDaysFromNow(),
	});

	// Create JWT tokens
	const sessionID = session._id as string;
	const accessToken = signToken({ sessionID, userID });
	const refreshToken = signToken({ sessionID }, refreshTokenSignOptions);
	setAuthCookie({ res, accessToken, refreshToken });

	await logActivity(req, {
		action: 'USER_LOGIN',
		description: 'User logged in via Google',
		resourceId: userID,
		resourceType: RESOURCE_TYPES.USER,
	});

	res.json({ accessToken, user, message: 'Login successful' });
});

/**
 * @route POST /api/v1/auth/forgot-password
 */
export const forgotPasswordHandler = asyncHandler(async (req, res) => {
	const { email } = req.body;

	await logActivity(req, {
		action: 'USER_FORGOT_PASSWORD',
		description: 'User forgot password',
		resourceId: email,
		resourceType: RESOURCE_TYPES.USER,
	});

	const user = await UserModel.findOne({ email });
	appAssert(user, BAD_REQUEST, 'Email not found');

	// generate token
	const resetToken = generateCypto();
	const hashedToken = hashCrypto(resetToken);

	// set token and expiry (1 hour)
	user.resetPasswordToken = hashedToken;
	user.resetPasswordExpires = ONE_HOUR_FROM_NOW;
	await user.save();

	// send email
	const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;

	const message = {
		from: `"Comprehensive Student Consultation Platform" <${EMAIL_USER}>`,
		to: user.email,
		subject: 'Password Reset Request',
		html: getPasswordResetEmailTemplate(resetURL),
	};

	await sendMail(message);

	res.json(new CustomResponse(true, null, 'Reset link has been sent.'));
});

/**
 * @route POST /api/v1/auth/reset-password/:token
 */
export const resetPasswordHandler = asyncHandler(async (req, res) => {
	const { token } = req.params;
	const { password } = req.body;

	// Hash token to compare with DB
	const hashedToken = hashCrypto(token ?? '');

	const user = await UserModel.findOne({
		resetPasswordToken: hashedToken,
		resetPasswordExpires: { $gt: new Date() },
	});

	await logActivity(req, {
		action: 'USER_RESET_PASSWORD',
		description: 'User reset password',
		resourceId: user?._id as string,
		resourceType: RESOURCE_TYPES.USER,
	});

	appAssert(user, BAD_REQUEST, 'Invalid or expired token');

	// Update password
	const hashedPassword = await bcrypt.hash(password, 10);
	user.password = hashedPassword;
	user.resetPasswordToken = '';
	user.resetPasswordExpires = undefined;
	await user.save();

	res.json(
		new CustomResponse(true, null, 'Password has been reset successfully')
	);
});

/**
 * @route GET /api/v1/auth/invite
 */
export const getInvitations = asyncHandler(async (req, res) => {
	const invitations = await InvitationModel.find({ status: 'pending' });
	res.json(new CustomResponse(true, invitations, 'Invitations found'));
});

/**
 * @route POST /api/v1/auth/invite/instructor
 */
export const inviteInstructor = asyncHandler(async (req, res) => {
	const { email, name } = req.body;

	await logActivity(req, {
		action: 'ADMIN_INVITE',
		description: 'Admin invited an instructor',
		resourceId: email,
		resourceType: RESOURCE_TYPES.USER,
	});

	// 1. Prevent duplicate invites
	const existingInvite = await InvitationModel.findOne({
		email,
		status: 'pending',
	});

	appAssert(
		!existingInvite,
		BAD_REQUEST,
		'An invitation is already pending for this email.'
	);

	const existingEmail = await UserModel.findOne({ email });
	appAssert(
		!existingEmail,
		BAD_REQUEST,
		'An account already exists for this email.'
	);

	// 2. Generate a unique token
	const token = generateCypto();
	const expiresAt = ONE_DAY_FROM_NOW;

	// 3. Create the invitation
	const invitation = await InvitationModel.create({
		email,
		name: name.toLowerCase(),
		token,
		expiresAt,
	});

	// 4. Construct email
	const inviteLink = `${FRONTEND_URL}/invite/instructor/accept?token=${token}`;
	const message = {
		from: `"Consultation Admin" <${EMAIL_USER}>`,
		to: email,
		subject: 'Instructor Invitation',
		html: `
      <div style="font-family:sans-serif;padding:1rem;border-radius:8px;background:#f9fafb;">
        <h2 style="color:#111;">You’ve been invited to join as an Instructor!</h2>
        <p>Hello ${name || ''},</p>
        <p>You’ve been invited to join the Comprehensive Student Consultation Platform as an Instructor.</p>
        <a href="${inviteLink}" 
           style="display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#111;color:#fff;border-radius:6px;text-decoration:none;">
           Accept Invitation
        </a>
        <p style="margin-top:1rem;font-size:12px;color:#555;">This link will expire in 24 hours.</p>
      </div>
    `,
	};

	await sendMail(message);

	res.json(new CustomResponse(true, null, 'Invitation sent successfully.'));
});

/**
 * @route POST /api/v1/auth/invite/instructor/accept
 */
export const acceptInvitation = asyncHandler(async (req, res) => {
	const { token, password } = req.body;

	const invitation = await InvitationModel.findOne({
		token,
		status: 'pending',
	});
	appAssert(
		invitation && invitation.expiresAt > new Date(),
		BAD_REQUEST,
		'Invalid or expired invitation link.'
	);

	// Create the instructor user
	const user = await UserModel.create({
		institutionalID: invitation.email?.split('@')[0],
		email: invitation.email,
		name: invitation.name,
		password: await bcrypt.hash(password, parseInt(BCRYPT_SALT)),
		role: 'instructor',
	});

	await logActivity(req, {
		action: 'USER_ACCEPT_INVITE',
		description: 'User accepted an invite',
		resourceId: user._id as string,
		resourceType: RESOURCE_TYPES.USER,
	});

	invitation.status = 'accepted';
	await invitation.save();

	res.json(
		new CustomResponse(
			true,
			user.omitPassword(),
			'Invitation accepted. Account created.'
		)
	);
});

export const googleCalendarHandler = asyncHandler(async (req, res) => {
	const scopes = ['https://www.googleapis.com/auth/calendar.events'];

	const url = oAuth2Client.generateAuthUrl({
		access_type: 'offline', // get refresh token
		scope: scopes,
		prompt: 'consent', // always ask for consent to get refresh token
	});

	res.redirect(url);
});

export const checkGoogleCalendarStatus = asyncHandler(async (req, res) => {
	const user = await UserModel.findById(req.user._id);

	const connected = !!(
		user?.googleCalendarTokens?.access_token ||
		user?.googleCalendarTokens?.refresh_token
	);

	res.json(
		new CustomResponse(
			true,
			{
				connected,
				accessToken: user?.googleCalendarTokens?.access_token,
				refreshToken: user?.googleCalendarTokens?.refresh_token,
			},
			'Google Calendar connection status'
		)
	);
});

export const googleCalendarCallbackHandler = asyncHandler(async (req, res) => {
	const code = req.query.code as string;
	appAssert(code, BAD_REQUEST, 'No code provided');

	const { tokens } = await oAuth2Client.getToken(code);
	console.log({ tokens });
	oAuth2Client.setCredentials(tokens);

	// Save tokens in user document
	const userId = req.user._id;
	appAssert(userId, BAD_REQUEST, 'User session not found');

	await UserModel.findByIdAndUpdate(userId, {
		googleCalendarTokens: tokens,
	});

	res.send(
		`<div>Google Calendar connected! You can now create meetings.<br><a href="${FRONTEND_URL}">Go back to the app</a></div>`
	);
});
