import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Users,
	GraduationCap,
	CalendarDays,
	Clock,
	Settings,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import type { Consultation } from '@/types/consultation';
import type { User } from '@/types/user';
import { QUERY_KEYS } from '@/constants';
import Header from '@/components/ui/header';

export default function AdminDashboard() {
	const navigate = useNavigate();

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
				<OverviewCard
					icon={<Users className='h-5 w-5 text-primary' />}
					label='Total Students'
					value={totalStudents}
				/>
				<OverviewCard
					icon={<GraduationCap className='h-5 w-5 text-primary' />}
					label='Total Instructors'
					value={totalInstructors}
				/>
				<OverviewCard
					icon={<CalendarDays className='h-5 w-5 text-primary' />}
					label='Consultations'
					value={totalConsultations}
				/>
				<OverviewCard
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

			<Separator className='my-6' />

			{/* === System Management === */}
			<section>
				<h2 className='text-lg font-medium mb-3'>System Management</h2>
				<div className='flex gap-3 flex-wrap'>
					<Button onClick={() => navigate('/admin/users')}>
						<Users className='mr-2 h-4 w-4' /> Manage Users
					</Button>
					<Button
						onClick={() => navigate('/admin/consultations')}
						variant='outline'
					>
						<CalendarDays className='mr-2 h-4 w-4' /> Consultation Logs
					</Button>
					<Button
						onClick={() => navigate('/admin/settings')}
						variant='secondary'
					>
						<Settings className='mr-2 h-4 w-4' /> System Settings
					</Button>
				</div>
			</section>
		</div>
	);
}

// === Overview Card ===
function OverviewCard({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground flex gap-2 items-center'>
					{icon}
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-semibold'>{value}</div>
			</CardContent>
		</Card>
	);
}
