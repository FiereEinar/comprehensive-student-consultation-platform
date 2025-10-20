import { fetchUserConsultations } from '@/api/consultation';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Ban, UserRound } from 'lucide-react';
import { Item, ItemContent, ItemDescription, ItemTitle } from '../ui/item';
import { Button } from '../ui/button';
import type { ConsultationStatus } from '@/types/consultation';
import { format } from 'date-fns';

type StudentConsultationTabsProps = {
	userID: string;
	status: ConsultationStatus;
};

export default function StudentConsultationTabs({
	userID,
	status,
}: StudentConsultationTabsProps) {
	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS, userID, status],
		queryFn: () => fetchUserConsultations(userID, status),
	});

	return (
		<div className='space-y-3'>
			<div className='text-muted-foreground italic'>
				{isLoading && <p>Loading...</p>}
				{error && <p>Error loading consultations</p>}
				{!consultations?.length && <p>No consultations found</p>}
			</div>
			{consultations?.map((consultation) => (
				<Card key={consultation._id} className='w-fit'>
					<CardContent className='flex items-center gap-20'>
						<div className='flex items-center gap-3 w-[200px]'>
							<UserRound className='w-8 h-8' />
							<ItemContent>
								<ItemTitle>{consultation.title}</ItemTitle>
								<ItemDescription>{consultation.student.name}</ItemDescription>
							</ItemContent>
						</div>

						<div className='text-right h-fit'>
							<ItemTitle>
								{format(new Date(consultation.scheduledAt), 'hh:mm a')}
							</ItemTitle>
							<ItemTitle>
								{format(new Date(consultation.scheduledAt), 'dd MMM')}
							</ItemTitle>
						</div>

						<div className='flex gap-2'>
							<Item className='p-2 px-4' variant='outline'>
								T106
							</Item>
							<Item className='p-2 px-4' variant='outline'>
								IT137
							</Item>
						</div>

						<div className='flex items-center gap-4'>
							<Button
								size='icon-sm'
								className='rounded-full'
								aria-label='Invite'
							>
								<Ban />
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
