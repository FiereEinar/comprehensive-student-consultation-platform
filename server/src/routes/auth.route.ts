import express from 'express';
import {
	acceptInvitation,
	checkGoogleCalendarStatus,
	forgotPasswordHandler,
	getInvitations,
	googleCalendarCallbackHandler,
	googleCalendarHandler,
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
const router = express.Router();

router.post('/login', loginHandler);
router.post('/signup', signupHandler);
router.post('/token/verify', verifyAuthHandler);
router.get('/logout', logoutHandler);
router.get('/refresh', refreshTokenHandler);

router.post('/recaptcha/verify', recaptchaVerify);
router.post('/google', googleLoginHandlerV2);
router.get('/google-calendar', auth, googleCalendarHandler);
router.get('/google-calendar/status', auth, checkGoogleCalendarStatus);
router.get('/google-calendar/callback', auth, googleCalendarCallbackHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password/:token', resetPasswordHandler);

// might wanna separate to /api/v1/invitations ???
router.get('/invite', getInvitations);
router.post('/invite/instructor', inviteInstructor);
router.post('/invite/instructor/accept', acceptInvitation);

export default router;
