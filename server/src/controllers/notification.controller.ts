import asyncHandler from 'express-async-handler';
import AppNotificationModel from '../models/app-notification';
import CustomResponse from '../utils/response';
import { NOT_FOUND } from '../constants/http';
import appAssert from '../errors/app-assert';

export const getUserNotifications = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	const notifications = await AppNotificationModel.find({ user: userID }).sort({
		createdAt: -1,
	});

	res.json(new CustomResponse(true, notifications, 'Notifications fetched'));
});

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

export const markAllRead = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	await AppNotificationModel.updateMany(
		{ user: userID, isRead: false },
		{ isRead: true }
	);

	res.json(new CustomResponse(true, null, 'All notifications marked as read'));
});

export const clearReadNotifications = asyncHandler(async (req, res) => {
	const userID = req.user._id;

	await AppNotificationModel.deleteMany({ user: userID, isRead: true });

	res.json(new CustomResponse(true, null, 'Read notifications cleared'));
});
