import { ErrorRequestHandler, Request, Response } from 'express';
import { z } from 'zod';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../constants/http';
import AppError from '../errors/app-error';
import { logActivity } from '../utils/activity-logger';

const handleAppError = (req: Request, res: Response, error: AppError) => {
	logActivity(req, {
		action: 'APP_ERROR',
		description: error.message,
		status: 'failure',
	});

	res.status(error.statusCode).json({
		message: error.message,
		errorCode: error.errorCode,
	});
};

const handleZodError = (req: Request, res: Response, error: z.ZodError) => {
	const errors = error.issues.map((err) => ({
		path: err.path.join('.'),
		message: err.message,
	}));

	logActivity(req, {
		action: 'VALIDATION_ERROR',
		description: error.message,
		status: 'failure',
	});

	res.status(BAD_REQUEST).json({
		errors,
		error: error.issues[0]?.message,
		message: error.message,
	});
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
	console.log(`PATH ${req.path}`, error);

	if (error instanceof z.ZodError) {
		handleZodError(req, res, error);
		return;
	}

	if (error instanceof AppError) {
		handleAppError(req, res, error);
		return;
	}

	logActivity(req, {
		action: 'ERROR',
		description: error.message,
		status: 'failure',
	});

	res
		.status(error.status || INTERNAL_SERVER_ERROR)
		.json({ message: error.message, status: error.status, stack: error.stack });
};
