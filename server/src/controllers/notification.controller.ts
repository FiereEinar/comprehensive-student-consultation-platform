import asyncHandler from 'express-async-handler';
import AppNotificationModel from '../models/app-notification';
import CustomResponse from '../utils/response';
import { NOT_FOUND } from '../constants/http';
import appAssert from '../errors/app-assert';

/**
 * @route GET /api/v1/notifications
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	const notifications = await AppNotificationModel.find({ user: userID }).sort({
		createdAt: -1,
	});

	res.json(new CustomResponse(true, notifications, 'Notifications fetched'));
});

/**
 * @route PATCH /api/v1/notifications/:id/read
 */
export const markNotificationRead = asyncHandler(async (req, res) => {
	const id = req.params.id;
	const userID = req.user._id;

	const notif = await AppNotificationModel.findOneAndUpdate(
		{ _id: id, user: userID },
		{ isRead: true },
		{ new: true }
	);

	appAssert(notif, NOT_FOUND, 'Notification not found');

	res.json(new CustomResponse(true, notif, 'Notification marked as read'));
});

/**
 * @route DELETE /api/v1/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
	const id = req.params.id;
	const userID = req.user._id;

	const deleted = await AppNotificationModel.findOneAndDelete({
		_id: id,
		user: userID,
	});

	appAssert(deleted, NOT_FOUND, 'Notification not found');

	res.json(new CustomResponse(true, deleted, 'Notification deleted'));
});

/**
 * @route PATCH /api/v1/notifications/read
 */
export const markAllRead = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	await AppNotificationModel.updateMany(
		{ user: userID, isRead: false },
		{ isRead: true }
	);

	res.json(new CustomResponse(true, null, 'All notifications marked as read'));
});

/**
 * @route DELETE /api/v1/notifications/read
 */
export const clearReadNotifications = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	await AppNotificationModel.deleteMany({ user: userID, isRead: true });

	res.json(new CustomResponse(true, null, 'Read notifications cleared'));
});
