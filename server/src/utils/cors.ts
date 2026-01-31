import { CorsOptions } from 'cors';
import { FRONTEND_URL } from '../constants/env';

const normalizedFrontendUrl = FRONTEND_URL.replace(/\/+$/, '');
// const normalizedBackendUrl = BACKEND_URL.replace(/\/+$/, '');

export const corsOptions: CorsOptions = {
	origin: normalizedFrontendUrl,
	credentials: true,
};
