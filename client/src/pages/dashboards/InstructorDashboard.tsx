import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	CalendarDays,
	Clock,
	UserPlus,
	CheckCircle2,
	Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import StatusBadge from '@/components/StatusBadge';
import type { Consultation } from '@/types/consultation';
import { QUERY_KEYS } from '@/constants';
import ConsultationCardActions from '@/components/ConsultationCardActions';
import Header from '@/components/ui/header';
import { fetchConsultations } from '@/api/consultation';
import { useUserStore } from '@/stores/user';
import DashboardOverviewCard from '@/components/DashboardOverviewCard';

export default function InstructorDashboard() {
	const { user } = useUserStore((state) => state);
	const navigate = useNavigate();

	// Fetch consultations assigned to this instructor
	const { data: consultations = [] } = useQuery<Consultation[]>({
		queryKey: [QUERY_KEYS.CONSULTATIONS, { userID: user?._id ?? '' }],
		queryFn: async () => fetchConsultations({ userID: user?._id ?? '' }),
	});

	const pendingConsultations = consultations.filter(
		(c) => c.status === 'pending'
	);
	const upcomingConsultations = consultations.filter(
		(c) => c.status === 'accepted'
	);
	const completedConsultations = consultations.filter(
		(c) => c.status === 'completed'
	);

	return (
		<div className='flex flex-col gap-6'>
			<Header size='md'>Good day, Instructor</Header>

			{/* === Overview Cards === */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<DashboardOverviewCard
					icon={<UserPlus className='h-5 w-5 text-primary' />}
					label='Pending Requests'
					value={pendingConsultations.length.toString()}
				/>
				<DashboardOverviewCard
					icon={<CalendarDays className='h-5 w-5 text-primary' />}
					label='Upcoming Consultations'
					value={upcomingConsultations.length.toString()}
				/>
				<DashboardOverviewCard
					icon={<CheckCircle2 className='h-5 w-5 text-primary' />}
					label='Completed Consultations'
					value={completedConsultations.length.toString()}
				/>
				<DashboardOverviewCard
					icon={<Clock className='h-5 w-5 text-primary' />}
					label='Set Availability'
					value={
						<Button
							variant='outline'
							size='sm'
							onClick={() => navigate('/availability')}
						>
							<Settings className='mr-1 h-4 w-4' /> Edit
						</Button>
					}
				/>
			</div>

			{/* === Pending Consultation Requests === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>
					Pending Consultation Requests
				</h2>
				<Card>
					<CardContent className='divide-y'>
						{pendingConsultations.length ? (
							pendingConsultations.map((c) => (
								<div
									key={c._id}
									className='flex justify-between py-3 items-center'
								>
									<div>
										<p className='font-medium'>{c.title}</p>
										<p className='text-sm text-muted-foreground'>
											Requested by {c.student.name}
										</p>
									</div>
									<ConsultationCardActions
										consultationID={c._id}
										status={c.status}
									/>
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No pending consultation requests.
							</p>
						)}
					</CardContent>
				</Card>
			</section>

			{/* === Upcoming Consultations === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Upcoming Consultations</h2>
				<Card>
					<CardContent className='divide-y'>
						{upcomingConsultations.length ? (
							upcomingConsultations.map((c) => (
								<div
									key={c._id}
									className='flex justify-between py-3 items-center'
								>
									<div>
										<p className='font-medium'>{c.title}</p>
										<p className='text-sm text-muted-foreground'>
											With {c.student.name} —{' '}
											{format(new Date(c.scheduledAt), 'MMM dd, hh:mm a')}
										</p>
									</div>
									<StatusBadge status={c.status} />
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No upcoming consultations.
							</p>
						)}
					</CardContent>
				</Card>
			</section>

			<Separator className='my-6' />

			{/* === Completed Consultations === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Completed Consultations</h2>
				<Card>
					<CardContent className='divide-y'>
						{completedConsultations.length ? (
							completedConsultations.map((c) => (
								<div
									key={c._id}
									className='flex justify-between py-3 items-center'
								>
									<div>
										<p className='font-medium'>{c.title}</p>
										<p className='text-sm text-muted-foreground'>
											With {c.student.name} —{' '}
											{format(new Date(c.scheduledAt), 'MMM dd, yyyy')}
										</p>
									</div>
									<StatusBadge status={c.status} />
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No completed consultations yet.
							</p>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
