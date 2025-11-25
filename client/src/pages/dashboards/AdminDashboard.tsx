import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, CalendarDays, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { format } from 'date-fns';
import StatusBadge from '@/components/StatusBadge';
import type { Consultation } from '@/types/consultation';
import type { User } from '@/types/user';
import { QUERY_KEYS } from '@/constants';
import Header from '@/components/ui/header';
import DashboardOverviewCard from '@/components/DashboardOverviewCard';

export default function AdminDashboard() {
	const { data: dashboardData } = useQuery({
		queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/consultation/dashboard-data');
			return data.data;
		},
	});

	const {
		totalStudents = 0,
		totalInstructors = 0,
		totalConsultations = 0,
		pendingConsultations = [],
		recentConsultations = [],
		activeInstructors = [],
		recentStudents = [],
	} = dashboardData || {};

	return (
		<div className='flex flex-col gap-6'>
			<Header size='md'>Admin Dashboard</Header>

			{/* === Overview Cards === */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<DashboardOverviewCard
					icon={<Users className='h-5 w-5 text-primary' />}
					label='Total Students'
					value={totalStudents}
				/>
				<DashboardOverviewCard
					icon={<GraduationCap className='h-5 w-5 text-primary' />}
					label='Total Instructors'
					value={totalInstructors}
				/>
				<DashboardOverviewCard
					icon={<CalendarDays className='h-5 w-5 text-primary' />}
					label='Consultations'
					value={totalConsultations}
				/>
				<DashboardOverviewCard
					icon={<Clock className='h-5 w-5 text-primary' />}
					label='Pending Requests'
					value={pendingConsultations.length}
				/>
			</div>

			{/* === Recent Consultations === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Recent Consultations</h2>
				<Card>
					<CardContent className='divide-y'>
						{recentConsultations.length ? (
							recentConsultations.map((c: Consultation) => (
								<div
									key={c._id}
									className='flex justify-between py-3 items-center'
								>
									<div>
										<p className='font-medium'>{c.title}</p>
										<p className='text-sm text-muted-foreground'>
											{c.student.name} with {c.instructor.name} —{' '}
											{format(new Date(c.scheduledAt), 'MMM dd, yyyy')}
										</p>
									</div>
									<StatusBadge status={c.status} />
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No recent consultations found.
							</p>
						)}
					</CardContent>
				</Card>
			</section>

			{/* === Active Instructors === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Active Instructors</h2>
				<Card>
					<CardContent className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
						{activeInstructors.length ? (
							activeInstructors.map((inst: User) => (
								<div
									key={inst._id}
									className='flex items-center justify-between border rounded-md p-3'
								>
									<div>
										<p className='font-medium'>{inst.name}</p>
										<p className='text-sm text-muted-foreground'>
											{inst.email}
										</p>
									</div>
									<Badge variant='outline'>Active</Badge>
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No active instructors at the moment.
							</p>
						)}
					</CardContent>
				</Card>
			</section>

			{/* === Student Activity Feed === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>Recent Student Activity</h2>
				<Card>
					<CardContent className='divide-y'>
						{recentStudents.length ? (
							recentStudents.map((s: User) => (
								<div
									key={s._id}
									className='flex justify-between py-3 items-center'
								>
									<div>
										<p className='font-medium'>{s.name}</p>
										<p className='text-sm text-muted-foreground'>
											Joined {format(new Date(s.createdAt), 'MMM dd, yyyy')}
										</p>
									</div>
									<Badge variant='secondary'>Student</Badge>
								</div>
							))
						) : (
							<p className='text-sm text-muted-foreground p-3'>
								No recent student activity.
							</p>
						)}
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
