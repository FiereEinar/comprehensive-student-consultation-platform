import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from './ui/card';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { Download, Edit, Trash } from 'lucide-react';

type BackupItem = {
	name: string;
	path: string;
	sizeBytes: number;
	createdAt: string;
};

type BackupListProps = {
	backups: BackupItem[];
	onDownload: (name: string) => void;
	onRestore: (item: BackupItem) => void;
	onRemove: (item: BackupItem) => void;
};

export default function BackupList({
	backups,
	onDownload,
	onRestore,
	onRemove,
}: BackupListProps) {
	if (!backups.length)
		return <div className='text-sm text-muted-foreground'>No backups yet.</div>;

	return (
		<div className='space-y-3'>
			{backups.map((b) => (
				<Card
					key={b.name}
					// className='p-3 border rounded flex items-center justify-between'
				>
					<CardContent className='flex justify-between gap-5'>
						<div>
							<div className='font-medium'>{b.name}</div>
							<div className='text-sm text-muted-foreground'>
								{formatDistanceToNow(new Date(b.createdAt))} ago •{' '}
								{(b.sizeBytes / (1024 * 1024)).toFixed(2)} MB
							</div>
						</div>

						<div className='flex gap-2'>
							<Button
								size='sm'
								variant='link'
								onClick={() => onDownload(b.name)}
								className='text-xs text-black'
							>
								<Download className='w-4 h-4' /> Download
							</Button>
							<Button
								size='sm'
								variant='link'
								onClick={() => onRestore(b)}
								className='text-xs text-blue-500'
							>
								<Edit className='w-4 h-4' /> Restore
							</Button>
							<ConfirmDeleteDialog
								onConfirm={() => onRemove(b)}
								trigger={
									<Button
										size='sm'
										variant='link'
										className='text-xs text-red-500'
									>
										<Trash className='w-4 h-4' /> Remove
									</Button>
								}
							/>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
