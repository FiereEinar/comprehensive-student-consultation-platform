import { fetchAvailabilities } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { Button } from './ui/button';
import { Ban } from 'lucide-react';

// Props for instructor ID
type InstructorAvailabilitiesProps = {
	instructorID: string;
	onEdit?: (availability: AvailabilityType) => void;
	viewOnly?: boolean;
};

type AvailabilityType = {
	_id: string;
	day: string;
	startTime: string;
	endTime: string;
	slots: string; // Adjust if your API returns number
	user: string;
};

export default function InstructorAvailabilities({
	instructorID,
	onEdit,
	viewOnly = false,
}: InstructorAvailabilitiesProps) {
	const {
		data: availabilities = [],
		isLoading,
		error,
	} = useQuery<AvailabilityType[]>({
		queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructorID],
		queryFn: () => fetchAvailabilities(instructorID),
	});

	const handleDelete = async (availabilityId: string) => {
		try {
			await axiosInstance.delete(`/availability/${availabilityId}`);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructorID],
			});
		} catch (err) {
			console.error('Failed to delete availability', err);
			toast.error('Failed to delete availability');
		}
	};

	return (
		<div>
			{isLoading && <p>Loading availability...</p>}
			{error && <p>Error loading availabilities</p>}
			<p className='mb-3'>Available Times:</p>
			<ul className={` pl-2 text-sm ${viewOnly && 'text-xs'}`}>
				{availabilities.map((availability) => (
					<li key={availability._id} className='flex items-start text-start'>
						<span>
							{availability.day}: {formatTime(availability.startTime)} -{' '}
							{formatTime(availability.endTime)} ({availability.slots} slots)
						</span>
						{!viewOnly && (
							<div className='ml-auto flex items-center gap-2'>
								<Button
									type='button'
									variant='link'
									size='sm'
									// className='cursor-pointer px-3 py-1 rounded-md bg-blue-500 hover:bg-blue-500/90 text-white text-xs'
									className='text-blue-500 flex items-center gap-1 text-xs'
									onClick={() => onEdit?.(availability)}
									title='Edit'
								>
									Edit
								</Button>
								<ConfirmDeleteDialog
									trigger={
										<Button
											type='button'
											variant='link'
											size='sm'
											className='text-red-500 flex items-center gap-1 text-xs'
											// className='cursor-pointer px-3 py-1 rounded-md bg-destructive hover:bg-destructive/90 text-white text-xs'
											title='Remove'
										>
											<Ban className='w-4 h-4' /> Remove
										</Button>
									}
									onConfirm={() => handleDelete(availability._id)}
								/>
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
