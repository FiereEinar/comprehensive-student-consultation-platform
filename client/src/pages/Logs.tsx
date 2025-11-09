import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { ActivityLog } from '@/types/log';
import { QUERY_KEYS } from '@/constants';
import axiosInstance from '@/api/axios';

export default function Logs() {
	const { data, isLoading, error } = useQuery({
		queryKey: [QUERY_KEYS.LOGS],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/log');
			console.log(data);
			return data.data as ActivityLog[];
		},
	});

	if (isLoading)
		return (
			<div className='flex justify-center items-center h-[80vh]'>
				<Loader2 className='animate-spin w-6 h-6' />
			</div>
		);

	if (error)
		return (
			<div className='text-center mt-10 text-red-500'>Failed to load logs.</div>
		);

	return (
		<div className='space-y-5'>
			<h1 className='text-2xl font-semibold'>System Logs</h1>

			<Card>
				<CardHeader className='grid grid-cols-6 font-medium text-muted-foreground text-sm border-b pb-2'>
					<span>User</span>
					<span>Action</span>
					<span>Description</span>
					<span>Status</span>
					<span>IP</span>
					<span>Timestamp</span>
				</CardHeader>

				<CardContent className='divide-y'>
					{data && data.length > 0 ? (
						data.map((log) => (
							<div
								key={log._id}
								className='grid grid-cols-6 py-3 text-sm items-center'
							>
								<span>{log.user?.name || 'System'}</span>
								<span className='font-medium'>{log.action}</span>
								<span className='truncate'>{log.description || '—'}</span>
								<span>
									<Badge
										variant={
											log.status === 'success' ? 'default' : 'destructive'
										}
									>
										{log.status}
									</Badge>
								</span>
								<span>{log.ipAddress || '—'}</span>
								<span className='text-muted-foreground text-xs'>
									{format(new Date(log.timestamp), 'PPpp')}
								</span>
							</div>
						))
					) : (
						<div className='py-6 text-center text-muted-foreground'>
							No logs found.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
