import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, UserCheck, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import StatusBadge from '@/components/StatusBadge';
import { QUERY_KEYS } from '@/constants';
import type { Consultation } from '@/types/consultation';
import { useUserStore } from '@/stores/user';
import { startCase } from 'lodash';
import ConsultationForm from '@/components/forms/ConsultationForm';
import Header from '@/components/ui/header';
import { fetchUserConsultations } from '@/api/consultation';
import { fetchInstructors } from '@/api/instructor';
import type { User } from '@/types/user';
import DashboardOverviewCard from '@/components/DashboardOverviewCard';

export default function StudentDashboard() {
	const { user } = useUserStore((state) => state);

	// Fetch consultations
	const { data: consultations = [] } = useQuery<Consultation[]>({
		queryKey: [QUERY_KEYS.CONSULTATIONS],
		queryFn: async () => fetchUserConsultations(user?._id ?? ''),
	});

	const { data: instructors } = useQuery<User[]>({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

	const upcomingConsultations = consultations.filter(
		(c) => c.status === 'accepted'
	);
	const pendingConsultations = consultations.filter(
		(c) => c.status === 'pending'
	);
	const completedConsultations = consultations.filter(
		(c) => c.status === 'completed'
	);

	const nextConsultation = upcomingConsultations[0];

	return (
		<div className='flex flex-col gap-6'>
			<Header size='md'>Welcome back, {startCase(user?.name)}</Header>

			{/* === Overview Cards === */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<DashboardOverviewCard
					icon={<CalendarDays className='h-5 w-5 text-primary' />}
					label='Upcoming Consultation'
					value={
						nextConsultation
							? format(
									new Date(nextConsultation.scheduledAt),
									'MMM dd, hh:mm a'
							  )
							: 'No upcoming'
					}
				/>
				<DashboardOverviewCard
					icon={<Clock className='h-5 w-5 text-primary' />}
					label='Pending Requests'
					value={pendingConsultations.length.toString()}
				/>
				<DashboardOverviewCard
					icon={<UserCheck className='h-5 w-5 text-primary' />}
					label='Completed Consultations'
					value={completedConsultations.length.toString()}
				/>
				<DashboardOverviewCard
					icon={<BookOpen className='h-5 w-5 text-primary' />}
					label='Available Instructors'
					value={instructors?.length.toString() ?? '0'}
				/>
			</div>

			{/* === Upcoming Consultations === */}
			<section>
				<div className='flex justify-between items-center mb-3'>
					<h2 className='text-lg font-medium'>Upcoming Consultations</h2>
					<Button
						variant='outline'
						size='sm'
						// onClick={() => navigate('/consultations')}
					>
						View All
					</Button>
				</div>
				<Card>
					<CardContent className='divide-y'>
						{upcomingConsultations.length ? (
							upcomingConsultations.map((c) => (
								<div
									key={c._id}
									className='flex justify-between items-center py-3'
								>
									<div>
										<p className='font-medium'>{c.title}</p>
										<p className='text-sm text-muted-foreground'>
											With {c.instructor.name} —{' '}
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

			{/* === Pending Requests === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Pending Requests</h2>
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
											{format(new Date(c.scheduledAt), 'MMM dd, hh:mm a')}
										</p>
									</div>
									<StatusBadge status={c.status} />
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

			{/* === Request Consultation Button === */}
			<div className='mt-4 flex justify-center'>
				<ConsultationForm title='Request Consultation' />
			</div>

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
											{format(new Date(c.scheduledAt), 'MMM dd, yyyy')}
										</p>
									</div>
									<Badge variant='secondary'>Completed</Badge>
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
