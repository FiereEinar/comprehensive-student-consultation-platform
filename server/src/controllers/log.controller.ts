import asyncHandler from 'express-async-handler';
import ActivityLogModel from '../models/activity-log.model';
import { CustomPaginatedResponse } from '../utils/response';
import { RESOURCE_TYPES } from '../constants';

/**
 * @route GET /logs
 * @desc Get paginated logs with filters
 * @query search - search keyword
 * @query resource - filter by resource type (comma separated for multiple)
 * @query startDate - filter by start date (ISO string)
 * @query endDate - filter by end date (ISO string)
 * @query page - page number (default 1)
 * @query limit - number of logs per page (default 20)
 * @query sort - sort order (asc or desc, default desc)
 */
export const getLogsHandler = asyncHandler(async (req, res) => {
	const {
		search = '',
		resource = '',
		startDate = '',
		endDate = '',
		page = 1,
		limit = 20,
		sort = 'desc',
	} = req.query;

	const numericPage = Number(page);
	const numericLimit = Number(limit);
	const skip = (numericPage - 1) * numericLimit;

	/** -------------------------
	 * MATCH FILTERS
	 * --------------------------*/
	const match: any = {};

	// Filter: resource type (supports multiple)
	if (resource) {
		const resources = (resource as string)
			.split(',')
			.map((r) => r.trim())
			.filter((r) => Object.values(RESOURCE_TYPES).includes(r));

		if (resources.length > 0) {
			match.resourceType = { $in: resources };
		}
	}

	// Filter: date range
	if (startDate || endDate) {
		match.timestamp = {};
		if (startDate) match.timestamp.$gte = new Date(startDate as string);
		if (endDate) match.timestamp.$lte = new Date(endDate as string);
	}

	/** -------------------------
	 * AGGREGATION PIPELINE
	 * --------------------------*/
	const pipeline: any[] = [
		{ $match: match },

		// Join User
		{
			$lookup: {
				from: 'users',
				localField: 'user',
				foreignField: '_id',
				as: 'user',
			},
		},
		{
			$unwind: {
				path: '$user',
				preserveNullAndEmptyArrays: true, // support system logs (no user)
			},
		},
	];

	/** -------------------------
	 * SEARCH
	 * --------------------------*/
	if (String(search).trim() !== '') {
		const regex = { $regex: search, $options: 'i' };

		pipeline.push({
			$match: {
				$or: [
					{ action: regex },
					{ description: regex },
					{ resourceId: regex },
					{ ipAddress: regex },
					{ 'user.name': regex },
					{ 'user.email': regex },
				],
			},
		});
	}

	/** -------------------------
	 * SORT
	 * --------------------------*/
	pipeline.push({
		$sort: { timestamp: sort === 'asc' ? 1 : -1 },
	});

	/** -------------------------
	 * PAGINATION
	 * --------------------------*/
	pipeline.push({ $skip: skip });
	pipeline.push({ $limit: numericLimit });

	/** -------------------------
	 * Run paginated query
	 * --------------------------*/
	const logs = await ActivityLogModel.aggregate(pipeline);

	/** -------------------------
	 * Total count
	 * --------------------------*/
	const totalPipeline = pipeline.filter(
		(stage) => !stage.$skip && !stage.$limit
	);

	const totalDocs = await ActivityLogModel.aggregate([
		...totalPipeline,
		{ $count: 'count' },
	]);

	const total = totalDocs[0]?.count || 0;

	const next = skip + numericLimit < total ? numericPage + 1 : -1;
	const prev = numericPage > 1 ? numericPage - 1 : -1;

	/** -------------------------
	 * RESPONSE
	 * --------------------------*/
	res.json(
		new CustomPaginatedResponse(
			true,
			logs,
			'Logs fetched successfully',
			next,
			prev
		)
	);
});
