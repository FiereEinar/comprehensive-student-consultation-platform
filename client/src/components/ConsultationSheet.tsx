import { startCase } from 'lodash';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import type { Consultation } from '@/types/consultation';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { Calendar, Clock, UserRound } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Button } from './ui/button';
import { useState } from 'react';
import { useUserStore } from '@/stores/user';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { Badge } from './ui/badge';

type ConsultationSheetProps = {
	consultation: Consultation;
	trigger: React.ReactNode;
};

export default function ConsultationSheet({
	consultation,
	trigger,
}: ConsultationSheetProps) {
	const { user } = useUserStore((state) => state);

	const { student, instructor, title, description, scheduledAt, status } =
		consultation;

	const [loading, setLoading] = useState(false);

	const handleGenerateMeeting = async () => {
		setLoading(true);

		try {
			await axiosInstance.post('/consultation/create-meeting', {
				consultationID: consultation._id,
				summary: `Consultation with ${student.name}`,
				startTime: scheduledAt,
				endTime: new Date(new Date(scheduledAt).getTime() + 60 * 60 * 1000), // 1 hour
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
		} catch (err: any) {
			if (err.status === 401) {
				// User does not have Google Calendar token → redirect to consent screen
				window.location.href =
					import.meta.env.VITE_API_URL + '/auth/google-calendar';
				// await axiosInstance.get('/auth/google-calendar');
			} else {
				alert('Failed to generate meeting link');
				console.error(err);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className='text-2xl font-semibold'>
						Consultation Details
					</SheetTitle>
					<SheetDescription>
						View all details of this consultation session.
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='flex flex-col gap-4 p-5 overflow-y-auto'>
					{/* Title and Description */}
					<div className='space-y-1'>
						<p className='text-xl font-semibold'>{startCase(title)}</p>
						<p className='text-sm text-muted-foreground'>{description}</p>
						<p className='text-sm text-muted-foreground'>
							Requested at: {format(consultation.createdAt, 'MMM dd, yyyy')}
						</p>
					</div>

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

					<Separator />

					{/* Consultation Information */}
					<div className='grid grid-cols-2 gap-3'>
						<Card className='col-span-2 py-3'>
							<CardContent className='px-3 flex items-center justify-between'>
								<span className='font-medium'>Status</span>
								<StatusBadge status={status} />
							</CardContent>
						</Card>

						<Card className='py-3'>
							<CardContent className='px-3 flex flex-col items-start justify-between'>
								<div className='flex items-center gap-2'>
									<Calendar className='w-4 h-4 text-muted-foreground' />
									<span className='font-medium'>Date</span>
								</div>
								<p className='text-sm'>
									{format(new Date(scheduledAt), 'MMM dd, yyyy')}
								</p>
							</CardContent>
						</Card>

						<Card className='py-3'>
							<CardContent className='px-3 flex flex-col items-start justify-between'>
								<div className='flex items-center gap-2'>
									<Clock className='w-4 h-4 text-muted-foreground' />
									<span className='font-medium'>Time</span>
								</div>
								<p className='text-sm'>
									{format(new Date(scheduledAt), 'hh:mm a')}
								</p>
							</CardContent>
						</Card>
					</div>

					<Separator />

					{/* Participants */}
					<div className='space-y-3'>
						<p className='font-medium text-sm text-muted-foreground'>
							Participants
						</p>

						<div className='flex flex-col gap-2'>
							<Card className='bg-muted/20 py-2'>
								<CardContent className='px-3 flex items-center gap-3'>
									<UserRound className='w-8 h-8 text-muted-foreground' />
									<div>
										<p className='font-medium'>{startCase(student.name)}</p>
										<p className='text-sm text-muted-foreground'>
											Student - {student.institutionalID}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className='bg-muted/20 py-2'>
								<CardContent className='px-3 flex items-center gap-3'>
									<UserRound className='w-8 h-8 text-muted-foreground' />
									<div>
										<p className='font-medium'>{startCase(instructor.name)}</p>
										<p className='text-sm text-muted-foreground'>Instructor</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					<Separator />

					{/* Generate Meeting Link */}
					{user &&
						user.role === 'instructor' &&
						consultation.status === 'accepted' && (
							<div className='flex flex-col gap-2'>
								<Button
									onClick={handleGenerateMeeting}
									disabled={loading || !!consultation.meetLink}
									className='w-full'
								>
									{loading ? 'Generating...' : 'Generate Meeting Link'}
								</Button>

								{consultation.meetLink && (
									<p className='text-sm text-blue-600 text-center'>
										<a
											href={consultation.meetLink}
											target='_blank'
											rel='noopener noreferrer'
										>
											Join Google Meet
										</a>
									</p>
								)}
							</div>
						)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
