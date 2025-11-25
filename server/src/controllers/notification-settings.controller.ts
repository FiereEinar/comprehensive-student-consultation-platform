import asyncHandler from 'express-async-handler';
import NotificationSettingsModel from '../models/notification-settings';
import appAssert from '../errors/app-assert';
import { NOT_FOUND } from '../constants/http';
import CustomResponse from '../utils/response';
import { createNotificationSettingsSchema } from '../schemas/notification-settings.schema';

export const getNotificationSettings = asyncHandler(async (req, res) => {
	const userID = req.query.userID;

	const notifSettings = await NotificationSettingsModel.findOne({
		user: userID,
	});
	appAssert(notifSettings, NOT_FOUND, 'Notification settings not found');

	res.json(
		new CustomResponse(true, notifSettings, 'Notification settings fetched')
	);
});

export const updateNotificationSettings = asyncHandler(async (req, res) => {
	const body = createNotificationSettingsSchema.parse(req.body);
	const userID = body.user;

	const notifSettings = await NotificationSettingsModel.findOneAndUpdate(
		{ user: userID },
		body,
		{ new: true, upsert: true }
	);

	res.json(
		new CustomResponse(true, notifSettings, 'Notification settings updated')
	);
});
