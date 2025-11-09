import asyncHandler from 'express-async-handler';
import ActivityLogModel from '../models/activity-log.model';
import CustomResponse from '../utils/response';
import { RESOURCE_TYPES } from '../constants';

export const getLogsHandler = asyncHandler(async (req, res) => {
	const { resource } = req.query;

	const filter: Record<string, any> = {};

	if (resource && Object.values(RESOURCE_TYPES).includes(resource as string)) {
		filter.resourceType = resource;
	}

	const logs = await ActivityLogModel.find(filter)
		.populate('user')
		.sort({ timestamp: -1 });

	res.json(new CustomResponse(true, logs, 'Logs fetched successfully'));
});
