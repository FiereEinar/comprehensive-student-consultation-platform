import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
dotenv.config();

import connectToMongoDB from './database/mongodb';
import { notFoundHandler } from './middlewares/not-found';
import { errorHandler } from './middlewares/error';
import { healthcheck } from './middlewares/healthcheck';
import { corsOptions } from './utils/cors';
import { PORT } from './constants/env';
import { auth } from './middlewares/auth';
// import { limiter } from './utils/rate-limiter';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import consultationRoutes from './routes/consultation.routes';
import instructorRoutes from './routes/instructor.routes';
import logRoutes from './routes/log.route';
import settingsRoutes from './routes/settings.routes';
// import { requestLogger } from './middlewares/logger';
import availabilityRoutes from './routes/availability.route';

const app = express();
app.use(cors(corsOptions));
// app.use(
// 	cookieSession({
// 		name: 'session',
// 		keys: ['secret1', 'secret2'],
// 		maxAge: 24 * 60 * 60 * 1000, // 1 day
// 	})
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
// app.use(requestLogger);
app.get('/', healthcheck);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use(auth);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/consultation', consultationRoutes);
app.use('/api/v1/instructor', instructorRoutes);
app.use('/api/v1/log', logRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/availability', availabilityRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
	await connectToMongoDB();
	console.log(`Server is running on http://localhost:${PORT}`);
});
