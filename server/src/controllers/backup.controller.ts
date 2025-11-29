import {
	BACKUPS_ROOT,
	listBackups,
	runBackup,
	runRestore,
	zipFolder,
} from '../utils/backup';
import asyncHandler from 'express-async-handler';
import appAssert from '../errors/app-assert';
import { BAD_REQUEST } from '../constants/http';
import CustomResponse from '../utils/response';
import path from 'path';
import fs from 'fs/promises';
import { MONGO_URI } from '../constants/env';
import { logActivity } from '../utils/activity-logger';
import { RESOURCE_TYPES } from '../constants';

const ensureExists = async (p: string) => {
	await fs.mkdir(p, { recursive: true });
};

// POST /backup/manual
export const manualBackup = asyncHandler(async (req, res) => {
	// require admin auth in route
	const mongoUri = req.body.mongoUri || MONGO_URI;
	appAssert(mongoUri, BAD_REQUEST, 'mongoUri required');

	const backupPath = await runBackup(mongoUri);

	await logActivity(req, {
		action: 'BACKUP_MANUAL',
		description: 'User created a manual backup',
		resourceType: RESOURCE_TYPES.BACKUP,
		resourceId: backupPath,
	});

	res.json(new CustomResponse(true, backupPath, 'Backup created'));
});

// GET /backup/history
export const backupHistory = asyncHandler(async (req, res) => {
	const items = await listBackups();

	res.json(new CustomResponse(true, items, 'Backup history fetched'));
});

// GET /backup/download?name=2025-01-01-xxxxx
export const downloadBackup = asyncHandler(async (req, res) => {
	const { name } = req.query;
	appAssert(name && typeof name === 'string', BAD_REQUEST, 'Name required');

	const folder = path.join(BACKUPS_ROOT, name);
	// validate exists
	await fs.access(folder);

	const zipName = `${name}.zip`;
	const tmpZipPath = path.join(BACKUPS_ROOT, zipName);

	// create zip (overwrite if exists)
	await zipFolder(folder, tmpZipPath);

	res.download(tmpZipPath, zipName, async (err) => {
		// optionally remove zip after download to save space
		try {
			await fs.unlink(tmpZipPath);
		} catch (e) {
			// ignore
		}
		if (err) console.error('download error', err);
	});

	await logActivity(req, {
		action: 'BACKUP_DOWNLOAD',
		description: 'User downloaded a backup',
		resourceType: RESOURCE_TYPES.BACKUP,
		resourceId: name,
	});
});

// POST /backup/restore  { name: '2025-01-01-xxxxx', targetUri?: '...' }
export const restoreBackup = asyncHandler(async (req, res) => {
	const { name, targetUri } = req.body;
	appAssert(name && typeof name === 'string', BAD_REQUEST, 'Name required');

	const folder = path.join(BACKUPS_ROOT, name, 'ipt2_cscp');
	await fs.access(folder);
	console.log({ folder, targetUri });
	await runRestore(folder, targetUri || MONGO_URI);

	await logActivity(req, {
		action: 'BACKUP_RESTORE',
		description: 'User restored a backup',
		resourceType: RESOURCE_TYPES.BACKUP,
		resourceId: name,
	});

	res.json({ success: true, message: 'Restore successful' });
});

// POST /backup/delete
export const deleteBackup = asyncHandler(async (req, res) => {
	const { name } = req.query;
	appAssert(name && typeof name === 'string', BAD_REQUEST, 'Name required');

	const folder = path.join(BACKUPS_ROOT, name);
	await fs.access(folder); // throws if folder doesn't exist

	await fs.rm(folder, { recursive: true, force: true });

	res.json({ success: true, message: `Backup ${name} deleted successfully` });
});
