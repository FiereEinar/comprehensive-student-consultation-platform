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
import { limiter } from './utils/rate-limiter';

import authRoutes from './routes/auth.route';
import consultationRoutes from './routes/consultation.routes';
import userRoutes from './routes/user.route';

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.get('/', healthcheck);

// Routes
app.use('/api/v1/auth', limiter, authRoutes);
app.use(auth);
app.use('/api/v1/consultation', consultationRoutes);
app.use('/api/v1/user', userRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, async () => {
	await connectToMongoDB();
	console.log(`Server is running on http://localhost:${PORT}`);
});
