const getEnv = (key: string, defaultValue?: string): string => {
	const value = process.env[key] || defaultValue;

	if (value === undefined) {
		throw new Error(`Environment variable ${key} is required`);
	}

	return value;
};

export const PORT = getEnv('PORT', '5000');
export const MONGO_URI = getEnv('MONGO_URI');
export const JWT_REFRESH_SECRET_KEY = getEnv('JWT_REFRESH_SECRET_KEY');
export const JWT_SECRET_KEY = getEnv('JWT_SECRET_KEY');
export const BCRYPT_SALT = getEnv('BCRYPT_SALT');
export const NODE_ENV = getEnv('NODE_ENV', 'development');
export const FRONTEND_URL = getEnv('FRONTEND_URL');
export const BACKEND_URL = getEnv('BACKEND_URL');
export const RECAPTCHA_SITE_KEY = getEnv('RECAPTCHA_SITE_KEY');
export const RECAPTCHA_SECRET_KEY = getEnv('RECAPTCHA_SECRET_KEY');
export const ACCESS_TOKEN_COOKIE_NAME = getEnv('ACCESS_TOKEN_COOKIE_NAME');
export const REFRESH_TOKEN_COOKIE_NAME = getEnv('REFRESH_TOKEN_COOKIE_NAME');
export const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET');
export const GOOGLE_REDIRECT_URI = getEnv('GOOGLE_REDIRECT_URI');
export const EMAIL_USER = getEnv('EMAIL_USER');
export const EMAIL_PASS = getEnv('EMAIL_PASS');
export const ADMIN_EMAIL = getEnv('ADMIN_EMAIL');
export const ADMIN_PASSWORD = getEnv('ADMIN_PASSWORD');
export const DATA_ENCRYPTION_KEY = getEnv('DATA_ENCRYPTION_KEY');
export const DROPBOX_ACCESS_TOKEN = getEnv('DROPBOX_ACCESS_TOKEN');
