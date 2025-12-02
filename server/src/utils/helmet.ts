import { HelmetOptions } from 'helmet';
import { FRONTEND_URL } from '../constants/env';

export const helmetConfig: HelmetOptions = {
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: [
				"'self'",
				'https://accounts.google.com', // Allow GSI client
				'https://apis.google.com',
			],
			imgSrc: [
				"'self'",
				'data:',
				'https://lh3.googleusercontent.com', // Allow Google profile pics
			],
			connectSrc: [
				"'self'",
				FRONTEND_URL,
				'https://accounts.google.com',
			].filter((url): url is string => Boolean(url)),
			frameSrc: ["'self'", 'https://accounts.google.com'],
			styleSrc: ["'self'", "'unsafe-inline'"],
			fontSrc: ["'self'"],
		},
	},
	crossOriginResourcePolicy: false,
};
