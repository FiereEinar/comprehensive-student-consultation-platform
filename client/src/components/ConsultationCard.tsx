import type { Consultation } from '@/types/consultation';
import { Card, CardContent } from './ui/card';
import { UserRound } from 'lucide-react';
import { ItemContent, ItemDescription, ItemTitle } from './ui/item';
import { format } from 'date-fns';
import { startCase } from 'lodash';
import { useUserStore } from '@/stores/user';
import { Badge } from './ui/badge';
import StatusBadge from './StatusBadge';
import ConsultationCardActions from './ConsultationCardActions';

type ConsultationCardProps = {
	consultation: Consultation;
	info?: 'student' | 'instructor';
};

export default function ConsultationCard({
	consultation,
	info = 'student',
}: ConsultationCardProps) {
	const { user } = useUserStore((state) => state);

	return (
		<Card className='py-3'>
			<CardContent className='flex flex-col gap-3 px-4'>
				<div className='flex items-center justify-between w-full'>
					<div className='flex gap-3 items-center'>
						<UserRound className='w-8 h-8' />
						<ItemContent className='gap-0'>
							<ItemTitle>{startCase(consultation.title)}</ItemTitle>
							<ItemDescription className='text-left'>
								{info === 'student'
									? startCase(consultation.student.name)
									: startCase(consultation.instructor.name)}
							</ItemDescription>
						</ItemContent>
					</div>
					<div className='text-right h-fit text-sm flex flex-col items-end gap-1'>
						<StatusBadge status={consultation.status} />
						<p>
							{format(
								new Date(consultation.scheduledAt),
								'MMM dd, yyyy - hh:mm a'
							)}
						</p>
					</div>
				</div>

				<div className='flex items-center justify-between gap-3 w-full'>
					<div className='flex gap-2'>
						<Badge variant='outline' className='text-muted-foreground bg-muted'>
							{consultation.sectonCode || 'T106'}
						</Badge>
						<Badge variant='outline' className='text-muted-foreground bg-muted'>
							{consultation.subjectCode || 'IT137'}
						</Badge>
						{consultation.purpose && (
							<Badge
								variant='outline'
								className='text-muted-foreground bg-muted'
							>
								{consultation.purpose}
							</Badge>
						)}
					</div>

					<div className='flex items-center gap-3'>
						{user?.role === 'instructor' && (
							<ConsultationCardActions
								consultationID={consultation._id}
								status={consultation.status}
							/>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
