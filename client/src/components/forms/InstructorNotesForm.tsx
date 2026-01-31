import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import { MODULES, QUERY_KEYS } from '@/constants';
import { Textarea } from '../ui/textarea';
import HasPermission from '../HasPermission';

type InstructorNotesFormProps = {
	consultationID: string;
	currentNotes?: string;
	hidden?: boolean;
	isOpen?: boolean;
	title?: string;
	description?: string;
};

export default function InstructorNotesForm({
	consultationID,
	currentNotes,
	hidden,
	isOpen,
	title,
	description,
}: InstructorNotesFormProps) {
	const [notes, setNotes] = useState(currentNotes || '');
	const [loading, setLoading] = useState(false);
	const [open, setOpen] = useState(isOpen || false);

	useEffect(() => {
		setOpen(isOpen || false);
	}, [isOpen]);

	const handleSave = async () => {
		setLoading(true);
		try {
			await axiosInstance.patch(
				`/consultation/${consultationID}/instructor-notes`,
				{ instructorNotes: notes },
			);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
			toast.success('Instructor notes updated');
		} catch (err: any) {
			console.error(err);
			toast.error('Failed to update notes');
		} finally {
			setLoading(false);
		}
	};

	return (
		<HasPermission permissions={[MODULES.UPDATE_CONSULTATION_NOTES]}>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button
						className={hidden ? 'hidden' : ''}
						size='sm'
						variant='outline'
						onClick={() => setOpen(true)}
					>
						Edit Notes
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-125'>
					<DialogHeader>
						<DialogTitle>{title || 'Instructor Notes'}</DialogTitle>
						<DialogDescription>
							{description || 'Update notes for this consultation'}
						</DialogDescription>
					</DialogHeader>

					<div className='mt-4'>
						<Textarea
							autoFocus
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder='Enter notes...'
							className='w-full'
						/>
					</div>

					<DialogFooter className='mt-4 flex justify-end gap-2'>
						<DialogClose asChild>
							<Button variant='outline'>Cancel</Button>
						</DialogClose>
						<Button onClick={handleSave} disabled={loading}>
							{loading ? 'Saving...' : 'Save'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</HasPermission>
	);
}
