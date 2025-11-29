import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from './ui/card';

type BackupItem = {
	name: string;
	path: string;
	sizeBytes: number;
	createdAt: string;
};

export default function BackupList({
	backups,
	onDownload,
	onRestore,
}: {
	backups: BackupItem[];
	onDownload: (name: string) => void;
	onRestore: (item: BackupItem) => void;
}) {
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
								variant='ghost'
								onClick={() => onDownload(b.name)}
							>
								Download
							</Button>
							<Button size='sm' onClick={() => onRestore(b)}>
								Restore
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
