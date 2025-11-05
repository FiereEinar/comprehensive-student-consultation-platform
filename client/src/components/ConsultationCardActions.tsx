import axiosInstance from '@/api/axios';
import { QUERY_KEYS } from '@/constants';
import { queryClient } from '@/main';
import type { ConsultationStatus } from '@/types/consultation';
import { Check, Ban, Ellipsis } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

type ConsultationCardActionsProps = {
	consultationID: string;
	status: ConsultationStatus;
};

export default function ConsultationCardActions({
	consultationID,
	status,
}: ConsultationCardActionsProps) {
	const handleAction = async (newStatus: ConsultationStatus) => {
		try {
			const { data } = await axiosInstance.patch(
				`/consultation/${consultationID}`,
				{ status: newStatus }
			);

			toast.success(data.message);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
		} catch (error: any) {
			console.error(`Failed to ${newStatus} consultation`, error);
			toast.error(error.message ?? `Failed to ${newStatus} consultation`);
		}
	};

	return (
		<div className='flex items-center gap-2 ml-auto'>
			{/* Inline primary actions */}
			{status === 'pending' && (
				<>
					<Button
						variant='link'
						size='sm'
						onClick={() => handleAction('accepted')}
						className='text-green-500 flex items-center gap-1 text-xs'
					>
						<Check className='w-4 h-4' /> Accept
					</Button>
					<ConfirmDeleteDialog
						trigger={
							<Button
								variant='link'
								size='sm'
								className='text-red-500 flex items-center gap-1 text-xs'
							>
								<Ban className='w-4 h-4' /> Decline
							</Button>
						}
						onConfirm={() => handleAction('declined')}
						confirmText='Decline'
						title='Decline request?'
						description='Are you sure you want to decline this request? This action can not be undone.'
					/>
				</>
			)}

			{/* Dropdown for secondary actions */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' size='icon'>
						<Ellipsis className='w-5 h-5' />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='end'>
					{status === 'accepted' && (
						<DropdownMenuItem
							onClick={() => handleAction('completed')}
							className='flex items-center gap-2 cursor-pointer'
						>
							<Check className='w-4 h-4' />
							Mark as Done
						</DropdownMenuItem>
					)}

					{status !== 'declined' && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => handleAction('declined')}
								className='flex items-center gap-2 cursor-pointer text-red-500'
							>
								<Ban className='w-4 h-4' /> Cancel
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
