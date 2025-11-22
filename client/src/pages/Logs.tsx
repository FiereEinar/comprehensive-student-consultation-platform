import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RESOURCE_TYPES, type LOG_RESOURCES } from '@/types/log';
import { QUERY_KEYS } from '@/constants';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { startCase } from 'lodash';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import PaginationController from '@/components/PaginationController';
import { useLogFilterStore } from '@/stores/log-filter';
import { fetchLogs } from '@/api/log';

export default function Logs() {
	const { page, setPage, getFilters, setSearch, resource, setResource } =
		useLogFilterStore((state) => state);

	const { data, isLoading, error } = useQuery({
		queryKey: [QUERY_KEYS.LOGS, getFilters()],
		queryFn: () => fetchLogs(getFilters()),
	});

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-semibold'>System Logs</h1>

				<div className='flex gap-2'>
					<Input
						className='bg-white'
						placeholder='Search'
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
					/>

					<Select
						value={resource}
						onValueChange={(val) => {
							setResource(val as LOG_RESOURCES);
							setPage(1);
						}}
					>
						<SelectTrigger className='bg-white'>
							<SelectValue placeholder='Filter by resource' />
						</SelectTrigger>
						<SelectContent>
							{Object.values(RESOURCE_TYPES).map((type) => (
								<SelectItem key={type} value={type}>
									{type}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<PaginationController
						currentPage={page}
						nextPage={page + 1}
						prevPage={page - 1}
						setPage={setPage}
						size='sm'
					/>
				</div>
			</div>

			<Card className='gap-0'>
				<CardHeader className='grid grid-cols-6 font-medium text-muted-foreground text-sm border-b pb-0'>
					<span>User</span>
					<span>Action</span>
					<span>Description</span>
					<span>Status</span>
					<span>IP</span>
					<span>Timestamp</span>
				</CardHeader>

				<CardContent className='divide-y'>
					{isLoading && <LoadingSpinner />}
					{error && (
						<div className='text-center mt-10 text-red-500'>
							Failed to load logs.
						</div>
					)}
					{data && data.length > 0 ? (
						data.map((log) => (
							<div
								key={log._id}
								className='grid grid-cols-6 py-3 text-sm items-center'
							>
								<span>{startCase(log.user?.name || 'System')}</span>
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
