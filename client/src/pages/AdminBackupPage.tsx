import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import BackupList from '@/components/BackupList';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/ui/header';
import { DialogDescription } from '@radix-ui/react-dialog';
import HasPermission from '@/components/HasPermission';
import { MODULES, QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/main';

type BackupItem = {
	name: string;
	path: string;
	sizeBytes: number;
	createdAt: string;
};

export default function AdminBackupPage() {
	const [loading, setLoading] = useState(false);
	const [confirm, setConfirm] = useState<{
		open: boolean;
		target?: BackupItem;
	}>({ open: false });

	const { data: localBackups } = useQuery({
		queryKey: [QUERY_KEYS.LOCAL_BACKUPS],
		queryFn: () => fetchLocalBackup(),
	});

	const { data: cloudBackups } = useQuery({
		queryKey: [QUERY_KEYS.CLOUD_BACKUPS],
		queryFn: () => fetchCloudBackup(),
	});

	const fetchLocalBackup = async (): Promise<BackupItem[]> => {
		try {
			const { data } = await axiosInstance.get('/backup/history');
			return data.data || ([] as BackupItem[]);
		} catch (err) {
			console.error(err);
			return [];
		}
	};

	const fetchCloudBackup = async (): Promise<BackupItem[]> => {
		try {
			const { data } = await axiosInstance.get('/backup/history/cloud');
			return data.data || ([] as BackupItem[]);
		} catch (err) {
			console.error(err);
			return [];
		}
	};

	const handleManual = async (cloud: boolean = false) => {
		try {
			setLoading(true);
			await axiosInstance.post('/backup/manual' + (cloud ? '/cloud' : ''));
			toast.success('Backup created');
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.LOCAL_BACKUPS, QUERY_KEYS.CLOUD_BACKUPS],
			});
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message || 'Backup failed');
		} finally {
			setLoading(false);
		}
	};

	const handleDownload = (name: string) => {
		const url = `${
			import.meta.env.VITE_API_URL
		}/backup/download?name=${encodeURIComponent(name)}`;

		window.open(url, '_blank');
	};

	const handleRestore = async (item: BackupItem) => {
		setConfirm({ open: false });
		try {
			setLoading(true);
			const { data } = await axiosInstance.post('/backup/restore', {
				name: item.name,
			});
			if (data.success) {
				toast.success('Restore started/completed');
			} else {
				toast.error('Restore failed');
			}
		} catch (err: any) {
			toast.error(err?.message || 'Restore failed');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (item: BackupItem) => {
		try {
			setLoading(true);
			const { data } = await axiosInstance.delete(`/backup/?name=${item.name}`);
			if (data.success) {
				toast.success('Backup removed');
			} else {
				toast.error('Failed to remove backup');
			}
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.LOCAL_BACKUPS, QUERY_KEYS.CLOUD_BACKUPS],
			});
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message || 'Failed to remove backup');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='space-y-6'>
			<Header size='md'>Backups</Header>
			<Card>
				<CardContent>
					<HasPermission
						userRole={['admin']}
						permissions={[MODULES.CREATE_BACKUP]}
					>
						<Card>
							<CardContent>
								<h2 className='font-medium mb-2'>Manual Backup</h2>
								<p className='text-sm text-muted-foreground mb-3'>
									Manually create a backup of the database.
								</p>

								<div className='flex gap-2'>
									{/* <Input
									placeholder='mongodb+srv://...'
									value={mongoUri}
									onChange={(e) => setMongoUri(e.target.value)}
								/> */}
									<Button onClick={() => handleManual()} disabled={loading}>
										{loading ? 'Creating...' : 'Create Backup'}
									</Button>
									<Button
										variant='outline'
										onClick={() => handleManual(true)}
										disabled={loading}
									>
										{loading ? 'Creating...' : 'Create Cloud Backup'}
									</Button>
								</div>
							</CardContent>
						</Card>
					</HasPermission>

					{/* <HasPermission
						userRole={['admin']}
						permissions={[MODULES.RESTORE_BACKUP]}
					>
						<ImportBackup fetchHistory={fetchHistory} />
					</HasPermission> */}

					<div className='mt-5'>
						<h2 className='text-lg font-medium mb-4'>Cloud Backup History</h2>
						<BackupList
							backups={cloudBackups || []}
							onDownload={() => {}}
							onRestore={() => {}}
							onRemove={() => {}}
							disableActions
						/>
					</div>

					<div className='mt-5'>
						<h2 className='text-lg font-medium mb-4'>Local Backup History</h2>
						<BackupList
							backups={localBackups || []}
							onDownload={handleDownload}
							onRestore={(item) => setConfirm({ open: true, target: item })}
							onRemove={handleRemove}
						/>
					</div>

					<Dialog
						open={confirm.open}
						onOpenChange={(o) =>
							setConfirm({ open: o, target: confirm.target })
						}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Confirm Restore</DialogTitle>
								<DialogDescription>
									Are you sure you want to restore backup{' '}
									<b>{confirm.target?.name}</b>? This will overwrite the current
									database.
								</DialogDescription>
							</DialogHeader>

							<DialogFooter>
								<Button
									variant='secondary'
									onClick={() => setConfirm({ open: false })}
								>
									Cancel
								</Button>
								<Button
									onClick={() =>
										confirm.target && handleRestore(confirm.target)
									}
									className='ml-2'
								>
									Restore
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardContent>
			</Card>
		</div>
	);
}

// function ImportBackup({ fetchHistory }: { fetchHistory: () => Promise<void> }) {
// 	const [loading, setLoading] = useState(false);
// 	const [importFile, setImportFile] = useState<File | null>(null);

// 	const handleImportBackup = async () => {
// 		if (!importFile) return toast.error('Please select a backup ZIP');

// 		const formData = new FormData();
// 		formData.append('backupZip', importFile);

// 		try {
// 			setLoading(true);
// 			await axiosInstance.post('/backup/import', formData, {
// 				headers: { 'Content-Type': 'multipart/form-data' },
// 			});
// 			toast.success('Backup imported successfully');
// 			fetchHistory();
// 			setImportFile(null);
// 		} catch (err: any) {
// 			console.error(err);
// 			toast.error(err?.message || 'Backup import failed');
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	return (
// 		<Card className='mt-4'>
// 			<CardContent>
// 				<h2 className='font-medium mb-2'>Import Backup</h2>
// 				<p className='text-sm text-muted-foreground mb-3'>
// 					Upload a backup ZIP file to restore the database.
// 				</p>

// 				<div className='flex gap-5 items-center'>
// 					<Button
// 						onClick={handleImportBackup}
// 						disabled={loading || !importFile}
// 					>
// 						{loading ? 'Importing...' : 'Import Backup'}
// 					</Button>
// 					<input
// 						type='file'
// 						accept='.zip'
// 						onChange={(e) => setImportFile(e.target.files?.[0] || null)}
// 					/>
// 				</div>
// 			</CardContent>
// 		</Card>
// 	);
// }
