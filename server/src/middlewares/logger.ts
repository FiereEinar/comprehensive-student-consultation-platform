import { RequestHandler } from 'express';
import { logger } from '../../config/logger';
import { logActivity } from '../utils/activity-logger';

export const requestLogger: RequestHandler = (req, res, next) => {
	logger.info({
		method: req.method,
		url: req.originalUrl,
		userId: req.user?._id,
		ip: req.ip,
	});
	next();
};

type ActivityLoggerProps = {
	action: string;
	description: string;
	resourceId?: string;
	resourceType?: string;
};
