import axiosInstance from '@/api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import type { ActivityLog } from '@/types/log';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface UserStats {
	totalUsers: number;
	activeUsers: number;
	archivedUsers: number;
	students: number;
	instructors: number;
	admins: number;
}

export default function UserRightSidebar() {
	const { user } = useUserStore((state) => state);

	const { data: userStats } = useQuery({
		queryKey: [QUERY_KEYS.USERS_STATS],
		queryFn: async (): Promise<UserStats | undefined> => {
			const { data } = await axiosInstance.get('/user/stats');
			return data.data;
		},
	});

	const { data: logs } = useQuery({
		queryKey: [QUERY_KEYS.LOGS, 'user'],
		queryFn: async (): Promise<ActivityLog[] | undefined> => {
			const { data } = await axiosInstance.get('/log?resource=User&limit=5');
			return data.data;
		},
	});

	return (
		<div className='w-[30%] space-y-3'>
			{/* A. USER STATISTICS */}
			<Card className='rounded-2xl shadow-sm'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>
						User Statistics
					</CardTitle>
				</CardHeader>
				<CardContent className='text-sm space-y-2'>
					{userStats && (
						<>
							<div className='flex justify-between'>
								<p className='font-medium text-gray-700'>Total Users:</p>
								<p className='text-gray-600'>{userStats.totalUsers}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-green-600'>Active Users:</p>
								<p>{userStats.activeUsers}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-gray-500'>Archived Users:</p>
								<p>{userStats.archivedUsers}</p>
							</div>

							<hr className='my-2' />

							<div className='flex justify-between'>
								<p className='font-medium text-blue-600'>Students:</p>
								<p>{userStats.students}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-purple-600'>Instructors:</p>
								<p>{userStats.instructors}</p>
							</div>

							<div className='flex justify-between'>
								<p className='font-medium text-red-600'>Admins:</p>
								<p>{userStats.admins}</p>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* B. RECENT USER LOGS */}
			{user?.role === 'admin' && (
				<Card className='rounded-2xl shadow-sm'>
					<CardHeader>
						<CardTitle className='text-lg font-semibold'>
							Recent User Activity
						</CardTitle>
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

			{/* C. QUICK ACTIONS */}
			<Card className='rounded-2xl shadow-sm'>
				<CardHeader>
					<CardTitle className='text-lg font-semibold'>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent className='text-sm space-y-2'>
					<div className='space-y-2'>
						<p className='text-gray-600'>
							Click on any user card to view and edit their details.
						</p>
						<p className='text-gray-600'>
							Use the tabs above to filter users by role.
						</p>
						<p className='text-gray-600'>
							Use the search bar to find specific users.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
