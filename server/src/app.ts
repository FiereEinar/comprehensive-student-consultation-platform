import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import path from 'path';
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
// import { requestLogger } from './middlewares/logger';

import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import consultationRoutes from './routes/consultation.routes';
import logRoutes from './routes/log.route';
import settingsRoutes from './routes/settings.routes';
import availabilityRoutes from './routes/availability.route';
import notificationRoutes from './routes/notification.routes';
import backupRoutes from './routes/backup.route';
import roleRoutes from './routes/role.route';
import { decryptBodyData } from './middlewares/decrypt';
connectToMongoDB();

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(decryptBodyData);
// app.use(requestLogger);
app.get('/', healthcheck);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use(auth);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/consultation', consultationRoutes);
app.use('/api/v1/log', logRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/api/v1/role', roleRoutes);

// Serve frontend (React build) after API routes
app.use(express.static(path.join(__dirname, '../../../client/dist')));
// Serve frontend (React build)
app.use((req, res, next) => {
	const indexPath = path.join(__dirname, '../../../client/dist/index.html');
	res.sendFile(indexPath, (err) => {
		if (err) next(err);
	});
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
