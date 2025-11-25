import { fetchAvailabilities } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { Button } from './ui/button';
import { Clock, PenLine, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

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
	const { data: availabilities = [] } = useQuery<AvailabilityType[]>({
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

	if (!availabilities.length && instructorID)
		return (
			<p className='text-sm text-muted-foreground mt-4'>
				No availability has been set.
			</p>
		);

	if (viewOnly) return <AvailavilityPreview availabilities={availabilities} />;

	// GROUP BY DAY
	const mergedByDay = availabilities.reduce(
		(acc, item) => ({
			...acc,
			[item.day]: [...(acc[item.day] ?? []), item],
		}),
		{} as Record<string, AvailabilityType[]>
	);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
			{Object.entries(mergedByDay).map(([day, items]) => (
				<Card
					key={day}
					className='rounded-2xl shadow-sm hover:shadow-md transition-all border border-border p-2'
				>
					<CardContent className='space-y-4 p-4'>
						{/* Day Badge */}
						<div className='flex items-center justify-between'>
							<Badge
								variant='outline'
								className='px-3 py-1 text-sm font-medium rounded-xl'
							>
								{day}
							</Badge>

							<Badge className='bg-primary/10 text-primary font-semibold rounded-xl'>
								{items.reduce((sum, i) => sum + Number(i.slots), 0)} Total Slots
							</Badge>
						</div>

						{/* Times grouped */}
						<div className='space-y-3'>
							{items.map((item) => (
								<div
									key={item._id}
									className='p-3 rounded-xl bg-muted/50 border flex flex-col gap-2'
								>
									<div className='flex items-center gap-2 text-sm text-muted-foreground'>
										<Clock size={16} className='text-primary' />
										<span className='font-medium'>
											{formatTime(item.startTime)} – {formatTime(item.endTime)}
										</span>
										<span className='ml-auto text-xs opacity-70'>
											({item.slots} slots)
										</span>
									</div>

									{/* Edit/Delete Buttons */}
									<div className='flex justify-end gap-2'>
										<Button
											variant='link'
											size='sm'
											className='text-black flex items-center gap-1 text-xs'
											onClick={() => onEdit?.(item)}
										>
											<PenLine size={14} />
											Edit
										</Button>

										<ConfirmDeleteDialog
											trigger={
												<Button
													variant='link'
													size='sm'
													className='text-red-500 flex items-center gap-1 text-xs'
												>
													<Trash2 size={14} />
													Delete
												</Button>
											}
											onConfirm={() => handleDelete(item._id)}
										/>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

type AvailavilityPreviewProps = {
	availabilities: AvailabilityType[];
};

function AvailavilityPreview({ availabilities }: AvailavilityPreviewProps) {
	return (
		<div>
			<p className='mb-3'>Available Times:</p>
			<ul className='pl-2 text-xs'>
				{availabilities.map((availability) => (
					<li key={availability._id} className='flex items-start text-start'>
						<span>
							{availability.day}: {formatTime(availability.startTime)} -{' '}
							{formatTime(availability.endTime)} ({availability.slots} slots)
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
