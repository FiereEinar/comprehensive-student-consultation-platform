import express from 'express';
import {
	acceptInvitation,
	checkGoogleCalendarStatus,
	deleteGoogleCalendarTokensHandler,
	forgotPasswordHandler,
	getInvitations,
	googleCalendarCallbackHandler,
	googleCalendarLoginHandler,
	googleLoginHandlerV2,
	inviteInstructor,
	loginHandler,
	logoutHandler,
	recaptchaVerify,
	refreshTokenHandler,
	resetPasswordHandler,
	signupHandler,
	verifyAuthHandler,
} from '../controllers/auth.controller';
import { auth } from '../middlewares/auth';
import { hasRole } from '../middlewares/authorization.middleware';
import { MODULES } from '../constants';

const router = express.Router();

router.post('/login', loginHandler);

router.post('/signup', signupHandler);

router.post('/token/verify', verifyAuthHandler);

router.get('/logout', logoutHandler);

router.get('/refresh', refreshTokenHandler);

router.post('/recaptcha/verify', recaptchaVerify);

router.post('/google', googleLoginHandlerV2);

router.get('/google-calendar', googleCalendarLoginHandler);

router.delete('/google-calendar', auth, deleteGoogleCalendarTokensHandler);

router.get('/google-calendar/status', auth, checkGoogleCalendarStatus);

router.get('/google-calendar/callback', googleCalendarCallbackHandler);

router.post('/forgot-password', forgotPasswordHandler);

router.post('/reset-password/:token', resetPasswordHandler);

// might wanna separate to /api/v1/invitations ???
router.get('/invite', getInvitations);

router.post(
	'/invite/instructor',
	auth,
	hasRole([MODULES.INVITE_INSTRUCTOR_USER]),
	inviteInstructor,
);

router.post('/invite/instructor/accept', acceptInvitation);

export default router;
