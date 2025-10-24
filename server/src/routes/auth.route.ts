import express from 'express';
import {
	googleLoginHandlerV2,
	loginHandler,
	logoutHandler,
	recaptchaVerify,
	refreshTokenHandler,
	signupHandler,
	verifyAuthHandler,
} from '../controllers/auth.controller';
const router = express.Router();

router.post('/login', loginHandler);
router.post('/signup', signupHandler);
router.post('/token/verify', verifyAuthHandler);
router.get('/logout', logoutHandler);
router.get('/refresh', refreshTokenHandler);
router.post('/recaptcha/verify', recaptchaVerify);
router.post('/google', googleLoginHandlerV2);

export default router;
