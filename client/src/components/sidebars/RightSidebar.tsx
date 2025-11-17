import axiosInstance from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import type { Consultation } from '@/types/consultation';
import type { ActivityLog } from '@/types/log';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface StatusBreakdown {
	accepted: number;
	pending: number;
	declined: number;
	completed: number;
}

interface TodayOverview {
	nextConsultation?: Consultation;
	pendingRequests: number;
	totalToday: number;
	activeMeetLink?: string;
	reminders?: string[];
}

export default function RightSidebar() {
	const { user } = useUserStore((state) => state);
	const { data: todayOverview } = useQuery({
		queryKey: [QUERY_KEYS.TODAYS_OVERVIEW],
		queryFn: async (): Promise<TodayOverview | undefined> => {
			const { data } = await axiosInstance.get('/consultation/today-overview');
			return data.data;
		},
	});

	const { data: status } = useQuery({
		queryKey: [QUERY_KEYS.STATUS_BREAKDOWN],
		queryFn: async (): Promise<StatusBreakdown | undefined> => {
			const { data } = await axiosInstance.get(
				'/consultation/status-breakdown'
			);
			return data.data;
		},
	});

	const { data: logs } = useQuery({
		queryKey: [QUERY_KEYS.LOGS, 'consultation'],
		queryFn: async (): Promise<ActivityLog[] | undefined> => {
			const { data } = await axiosInstance.get(
				'/log?resource=Consultation&limit=5'
			);
			return data.data;
		},
	});

	return (
		<div className='w-[30%] space-y-3'>
			{/* A. TODAY'S OVERVIEW */}
			<Card className='rounded-2xl shadow-sm'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>
						Today’s Overview
					</CardTitle>
				</CardHeader>
				<CardContent className='text-sm space-y-3'>
					{todayOverview && (
						<>
							<div>
								<p className='font-medium text-gray-700'>Next Consultation:</p>
								<p className='text-gray-600'>
									{todayOverview.nextConsultation ? (
										<>
											<span>
												{['instructor', 'admin'].includes(user?.role ?? '')
													? todayOverview.nextConsultation.student.name
													: todayOverview.nextConsultation.instructor.name}
											</span>{' '}
											-{' '}
											<span>
												{format(
													new Date(todayOverview.nextConsultation.scheduledAt),
													'h:mm a'
												)}
											</span>
										</>
									) : (
										'No upcoming consultation'
									)}
								</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-gray-700'>Pending Requests:</p>
								<p className='text-gray-600'>{todayOverview.pendingRequests}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-gray-700'>
									Consultations Today:
								</p>
								<p className='text-gray-600'>{todayOverview.totalToday}</p>
							</div>

							{todayOverview.activeMeetLink && (
								<a
									href={todayOverview.activeMeetLink}
									target='_blank'
									className='block text-blue-600 hover:underline font-medium'
								>
									Join Active Meet
								</a>
							)}

							{/* Reminders */}
							{todayOverview.reminders &&
								todayOverview.reminders.length > 0 && (
									<div>
										<p className='font-medium text-gray-700 mb-1'>Reminders:</p>
										<ul className='list-disc ml-5 text-gray-600 space-y-1'>
											{todayOverview.reminders.map((item, i) => (
												<li key={i}>{item}</li>
											))}
										</ul>
									</div>
								)}
						</>
					)}
				</CardContent>
			</Card>

			{/* B. STATUS BREAKDOWN */}
			<Card className='rounded-2xl shadow-sm'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>
						Status Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent className='text-sm space-y-2'>
					{status && (
						<>
							<div className='flex justify-between'>
								<p className='font-medium text-blue-600'>Accepted:</p>
								<p>{status.accepted}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-yellow-600'>Pending:</p>
								<p>{status.pending}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-red-600'>Declined:</p>
								<p>{status.declined}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-green-600'>Completed:</p>
								<p>{status.completed}</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* C. RECENT CONSULTATION LOGS */}
			{user?.role === 'admin' && (
				<Card className='rounded-2xl shadow-sm'>
					<CardHeader>
						<CardTitle className='text-lg font-semibold'>Recent Logs</CardTitle>
					</CardHeader>
					<CardContent className='text-sm space-y-3'>
						{logs && (
							<>
								{logs.length === 0 ? (
									<p className='text-gray-500'>No recent activity</p>
								) : (
									logs.map((log) => (
										<div
											key={log._id}
											className='border-l-4 border-blue-500 pl-3'
										>
											<p className='font-medium text-gray-700'>
												{log.description}
											</p>
											<p className='text-xs text-gray-500'>
												{log.user?.name} - {format(log.timestamp, 'hh:mm a')}
											</p>
										</div>
									))
								)}
							</>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
