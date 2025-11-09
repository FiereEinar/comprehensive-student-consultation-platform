import asyncHandler from 'express-async-handler';
import ActivityLogModel from '../models/activity-log.model';
import CustomResponse from '../utils/response';

export const getLogsHandler = asyncHandler(async (req, res) => {
	const logs = await ActivityLogModel.find()
		.populate('user')
		.sort({ timestamp: -1 });

	res.json(new CustomResponse(true, logs, 'Logs fetched successfully'));
});
