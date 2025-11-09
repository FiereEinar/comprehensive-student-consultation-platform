import { Request } from 'express';
import ActivityLogModel from '../models/activity-log.model';

type LogActivityParams = {
	action: string;
	resourceId?: string | undefined;
	resourceType?: string | undefined;
	description?: string;
	status?: 'success' | 'failure';
};

export async function logActivity(
	req: Request,
	{
		action,
		resourceType,
		resourceId,
		description,
		status = 'success',
	}: LogActivityParams
) {
	try {
		const user = req.user?._id || null;

		await ActivityLogModel.create({
			user,
			action,
			description,
			resourceType,
			resourceId,
			ipAddress: req?.ip || req?.headers['x-forwarded-for'] || 'unknown',
			userAgent: req?.headers['user-agent'] || 'unknown',
			status,
		});
	} catch (err) {
		console.error('Failed to log activity:', err);
	}
}
