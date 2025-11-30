import { useEffect, useState } from 'react';
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

type BackupItem = {
	name: string;
	path: string;
	sizeBytes: number;
	createdAt: string;
};

export default function AdminBackupPage() {
	const [loading, setLoading] = useState(false);
	const [history, setHistory] = useState<BackupItem[]>([]);
	const [confirm, setConfirm] = useState<{
		open: boolean;
		target?: BackupItem;
	}>({ open: false });

	const fetchHistory = async () => {
		try {
			const { data } = await axiosInstance.get('/backup/history');
			if (data?.success) setHistory(data.data || []);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchHistory();
	}, []);

	const handleManual = async () => {
		try {
			setLoading(true);
			const { data } = await axiosInstance.post('/backup/manual');
			if (data.success) {
				toast.success('Backup created');
				fetchHistory();
			} else {
				toast.error('Backup failed');
			}
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
				fetchHistory();
			} else {
				toast.error('Failed to remove backup');
			}
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
								<Button onClick={handleManual} disabled={loading}>
									{loading ? 'Creating...' : 'Create Backup'}
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className='mt-5'>
						<h2 className='text-lg font-medium mb-4'>Backup History</h2>
						<BackupList
							backups={history}
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
