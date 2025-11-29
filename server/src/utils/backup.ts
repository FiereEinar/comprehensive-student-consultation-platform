import { exec } from 'child_process';
import path from 'path';
import fspromise from 'fs/promises';
import archiver from 'archiver';
import fs from 'fs';

export const BACKUPS_ROOT = path.join(__dirname, '..', '..', 'backups');

export const runBackup = (mongoUri: string): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		try {
			const date = new Date().toISOString().split('T')[0];
			const backupDir = path.join(BACKUPS_ROOT, date + '-' + Date.now());

			await fspromise.mkdir(backupDir, { recursive: true });

			const cmd = `mongodump --uri="${mongoUri}" --out="${backupDir}"`;
			exec(cmd, (err, stdout, stderr) => {
				if (err) {
					return reject(new Error(stderr || err.message));
				}
				resolve(backupDir);
			});
		} catch (err) {
			reject(err);
		}
	});
};

export const runRestore = (
	backupFolder: string,
	mongoUri: string
): Promise<void> => {
	return new Promise(async (resolve, reject) => {
		try {
			// Validate path exists
			// await fspromise.access(backupPath);

			// const uriPart = targetUri ? `--uri="${targetUri}"` : '';
			// // restore all DBs found in backupPath
			// const cmd = `mongorestore ${uriPart} --drop "${backupPath}"`;
			const cmd = `mongorestore --uri="${mongoUri}" --drop "${backupFolder}"`;
			exec(cmd, (err, stdout, stderr) => {
				if (err) {
					return reject(new Error(stderr || err.message));
				}
				resolve();
			});
		} catch (err) {
			reject(err);
		}
	});
};

export const zipFolder = (
	sourceDir: string,
	outPath: string
): Promise<void> => {
	return new Promise((resolve, reject) => {
		const output = fs.createWriteStream(outPath);
		const archive = archiver('zip', { zlib: { level: 9 } });

		output.on('close', () => resolve());
		archive.on('error', (err) => reject(err));

		archive.pipe(output);
		archive.directory(sourceDir, false);
		archive.finalize();
	});
};

export const listBackups = async (): Promise<
	{ name: string; path: string; sizeBytes: number; createdAt: string }[]
> => {
	try {
		const exists = await fspromise
			.stat(BACKUPS_ROOT)
			.then(() => true)
			.catch(() => false);
		if (!exists) return [];

		const entries = await fspromise.readdir(BACKUPS_ROOT);
		const results: any[] = [];

		await Promise.all(
			entries.map(async (name) => {
				const full = path.join(BACKUPS_ROOT, name);
				const stat = await fspromise.stat(full);
				results.push({
					name,
					path: full,
					sizeBytes: stat.isDirectory() ? await dirSize(full) : stat.size,
					createdAt: stat.birthtime.toISOString(),
				});
			})
		);

		// newest first
		results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
		return results;
	} catch (err) {
		console.error('listBackups error', err);
		return [];
	}
};

const dirSize = async (p: string): Promise<number> => {
	const entries = await fspromise.readdir(p, { withFileTypes: true });
	let total = 0;
	for (const e of entries) {
		const full = path.join(p, e.name);
		if (e.isFile()) {
			total += (await fspromise.stat(full)).size;
		} else if (e.isDirectory()) {
			total += await dirSize(full);
		}
	}
	return total;
};
