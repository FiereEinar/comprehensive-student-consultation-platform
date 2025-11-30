import axiosInstance from '@/api/axios';
import { QUERY_KEYS } from '@/constants';
import { queryClient } from '@/main';
import type { Consultation, ConsultationStatus } from '@/types/consultation';
import { Check, Ban, Ellipsis, Info, Trash } from 'lucide-react';
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
import { useState } from 'react';
import { useUserStore } from '@/stores/user';

type ConsultationCardActionsProps = {
	consultation: Consultation;
	status: ConsultationStatus;
};

export default function ConsultationCardActions({
	consultation,
	status,
}: ConsultationCardActionsProps) {
	const consultationID = consultation._id;
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useUserStore((state) => state);
	const isStudent = user?.role === 'student';

	const handleAction = async (
		newStatus: ConsultationStatus,
		withGMeet: boolean = false
	) => {
		try {
			setIsLoading(true);
			const { data } = await axiosInstance.patch(
				`/consultation/${consultationID}/status`,
				{ status: newStatus, withGMeet }
			);

			toast.success(data.message);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
		} catch (error: any) {
			if (error.status === 401) {
				// User does not have Google Calendar token → redirect to consent screen
				window.location.href =
					import.meta.env.VITE_API_URL + '/auth/google-calendar';
				// await axiosInstance.get('/auth/google-calendar');
			} else {
				console.error(`Failed to ${newStatus} consultation`, error);
				toast.error(error.message ?? `Failed to ${newStatus} consultation`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (consultationID: string) => {
		try {
			await axiosInstance.delete(`/consultation/${consultationID}`);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
			toast.success('Consultation deleted successfully!');
		} catch (err) {
			console.error('Failed to delete consultation', err);
			toast.error('Failed to delete consultation');
		}
	};

	return (
		<div className='flex items-center gap-2 ml-auto'>
			{/* Inline primary actions */}
			{status === 'pending' && !isStudent && (
				<>
					<ConfirmDeleteDialog
						icon={<Info className='size-5 text-blue-500' />}
						title='Create Google Meet Link?'
						description='Would you like to generate google meet link'
						onConfirm={() => handleAction('accepted', true)}
						confirmText='Create'
						onCancel={() => handleAction('accepted')}
						cancelText='Skip'
						trigger={
							<Button
								disabled={isLoading}
								variant='link'
								size='sm'
								className='text-green-500 flex items-center gap-1 text-xs'
							>
								<Check className='w-4 h-4' /> Accept
							</Button>
						}
					/>
					<ConfirmDeleteDialog
						trigger={
							<Button
								disabled={isLoading}
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

			{(status === 'declined' || status === 'completed') && !isStudent && (
				<ConfirmDeleteDialog
					onConfirm={() => handleDelete(consultationID)}
					trigger={
						<Button
							variant='link'
							size='sm'
							className='text-red-500 flex items-center gap-1 text-xs'
						>
							<Trash className='w-4 h-4' /> Delete
						</Button>
					}
				/>
			)}

			{/* {status === 'accepted' && ( */}
			{!isStudent && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' size='icon'>
							<Ellipsis className='w-5 h-5' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<>
							<DropdownMenuItem
								onClick={() => handleAction('completed')}
								className='flex items-center gap-2 cursor-pointer'
							>
								<Check className='w-4 h-4' />
								Mark as Done
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem
								onClick={() => handleAction('declined')}
								className='flex items-center gap-2 cursor-pointer text-red-500'
							>
								<Ban className='w-4 h-4 text-red-500' /> Cancel
							</DropdownMenuItem>
						</>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
