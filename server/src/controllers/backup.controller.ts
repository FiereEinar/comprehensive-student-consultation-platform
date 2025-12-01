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
import { DROPBOX_ACCESS_TOKEN, MONGO_URI } from '../constants/env';
import { logActivity } from '../utils/activity-logger';
import { RESOURCE_TYPES } from '../constants';
import { Dropbox } from 'dropbox';
import fsSync from 'fs';
import { exec } from 'child_process';

// POST /backup/manual
// uses GOOGLE DRIVE as cloud backup storage
// not used, currently using Dropbox
export const manualBackup = asyncHandler(async (req, res) => {
	const backupPath = await runBackup(MONGO_URI);

	// 4. LOG ACTIVITY
	await logActivity(req, {
		action: 'BACKUP_MANUAL',
		description: 'User created a manual backup (ZIP + Drive)',
		resourceType: RESOURCE_TYPES.BACKUP,
		resourceId: backupPath,
	});

	res.json(new CustomResponse(true, backupPath, 'Backup created'));
});

// POST /backup/manual
// uses DROPBOX as cloud backup storage
export const manualCloudBackup = asyncHandler(async (req, res) => {
	// create local backup
	const backupPath = await runBackup(MONGO_URI);
	const backupFolderName = path.basename(backupPath);
	const zipPath = path.join(BACKUPS_ROOT, 'zips', `${backupFolderName}.zip`);
	await fsSync.promises.mkdir(path.join(BACKUPS_ROOT, 'zips'), {
		recursive: true,
	});
	await zipFolder(backupPath, zipPath);

	// upload to Dropbox
	const dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });

	const fileContent = fsSync.readFileSync(zipPath);
	const dropboxPath = `/CSCP_Backups/${backupFolderName}.zip`;

	const response = await dbx.filesUpload({
		path: dropboxPath,
		contents: fileContent,
		mode: { '.tag': 'overwrite' },
	});

	// delete local backup
	const folder = path.join(BACKUPS_ROOT, backupFolderName);
	await fs.access(folder); // throws if folder doesn't exist

	await fs.rm(folder, { recursive: true, force: true });

	await logActivity(req, {
		action: 'BACKUP_MANUAL',
		description: 'User created a manual backup (ZIP + Dropbox)',
		resourceType: RESOURCE_TYPES.BACKUP,
		resourceId: backupFolderName,
	});

	res.json(
		new CustomResponse(
			true,
			{
				localFolder: backupPath,
				localZip: zipPath,
				dropboxPath: response.result.path_display,
				dropboxId: response.result.id,
			},
			'Backup created'
		)
	);
});

// GET /backup/history
export const backupHistory = asyncHandler(async (req, res) => {
	const items = await listBackups();

	res.json(new CustomResponse(true, items, 'Backup history fetched'));
});

/**
 * @route GET /backup/dropbox
 * @desc Get list of backups stored in Dropbox
 */
export const getDropboxBackups = asyncHandler(async (req, res) => {
	try {
		const dbx = new Dropbox({
			accessToken: DROPBOX_ACCESS_TOKEN,
			fetch: fetch,
		});
		// List files in the root (or a specific folder)
		const response = await dbx.filesListFolder({ path: '/CSCP_Backups' });
		const localBackups = await listBackups();

		// Filter only zip files
		const backups = response.result.entries
			.filter((file) => file['.tag'] === 'file' && file.name.endsWith('.zip'))
			.map((file: any) => ({
				name: file.name,
				pathLower: file.path_lower,
				sizeBytes: file.size,
				createdAt: file.client_modified,
			}));

		res.json(new CustomResponse(true, backups, 'Dropbox backups fetched'));
	} catch (err: any) {
		console.error(err);
		res
			.status(500)
			.json(
				new CustomResponse(
					false,
					null,
					'Failed to fetch Dropbox backups',
					err.message
				)
			);
	}
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

/**
 * @route POST /backup/import
 * @desc Import a backup from a ZIP file
 */
export const importBackup = asyncHandler(async (req, res) => {
	console.log('Uploaded file:', req.file);
	appAssert(req.file, BAD_REQUEST, 'Backup ZIP is required');

	const zipPath = req.file.path;
	const tempFolder = path.join(path.dirname(zipPath), `restore-${Date.now()}`);

	await fs.mkdir(tempFolder, { recursive: true });

	// 1. Extract the zip
	const unzipCmd = `unzip "${zipPath}" -d "${tempFolder}"`;
	await new Promise<void>((resolve, reject) => {
		exec(unzipCmd, (err, stdout, stderr) => {
			if (err) return reject(new Error(stderr || err.message));
			resolve();
		});
	});

	// 2. Run mongorestore
	const restoreCmd = `mongorestore --uri="${process.env.MONGO_URI}" "${tempFolder}" --drop`;
	await new Promise<void>((resolve, reject) => {
		exec(restoreCmd, (err, stdout, stderr) => {
			if (err) return reject(new Error(stderr || err.message));
			resolve();
		});
	});

	// 3. Log activity
	await logActivity(req, {
		action: 'BACKUP_IMPORT',
		description: 'Imported backup from ZIP',
		resourceType: RESOURCE_TYPES.BACKUP,
	});

	// 4. Cleanup
	await fs.rm(tempFolder, { recursive: true, force: true });
	await fs.rm(zipPath, { force: true });

	res.json(new CustomResponse(true, null, 'Backup imported successfully'));
});
