import { CorsOptions } from 'cors';
import { BACKEND_URL, FRONTEND_URL } from '../constants/env';

export const corsOptions: CorsOptions = {
	origin: [FRONTEND_URL, BACKEND_URL],
	credentials: true,
};
