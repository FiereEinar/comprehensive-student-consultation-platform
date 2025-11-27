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
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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

					{data?.length === 0 && (
						<div className='text-center mt-10 text-muted-foreground italic'>
							No logs found.
						</div>
					)}

					{data &&
						data.length > 0 &&
						data.map((log) => (
							<Sheet key={log._id}>
								<SheetTrigger asChild>
									<div className='grid grid-cols-6 py-3 text-sm items-center cursor-pointer hover:bg-muted/50 transition'>
										<span>{startCase(log.user?.name || 'System')}</span>
										<span className='truncate font-medium'>{log.action}</span>
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
								</SheetTrigger>

								{/* LOG DETAILS SHEET */}
								<SheetContent side='right' className='w-[420px]'>
									<SheetHeader>
										<SheetTitle>Log Details</SheetTitle>
										<SheetDescription>
											Full details of the selected activity log.
										</SheetDescription>
									</SheetHeader>

									<div className='p-4 space-y-4 text-sm overflow-auto'>
										<DetailItem
											label='User'
											value={startCase(log.user?.name || 'System')}
										/>
										<DetailItem label='Action' value={log.action} />
										<DetailItem
											label='Description'
											value={log.description || '—'}
											multiline
										/>
										<DetailItem label='Status' value={log.status} />

										<Separator />

										<DetailItem
											label='IP Address'
											value={log.ipAddress || '—'}
										/>
										<DetailItem
											label='User Agent'
											value={log.userAgent || '—'}
										/>
										<DetailItem label='URL' value={log.url || '—'} />
										<DetailItem
											label='Resource Type'
											value={log.resourceType || '—'}
										/>
										<DetailItem
											label='Resource ID'
											value={log.resourceId || '—'}
										/>

										<Separator />

										<DetailItem
											label='Timestamp'
											value={format(new Date(log.timestamp), 'PPpp')}
										/>
									</div>
								</SheetContent>
							</Sheet>
						))}
				</CardContent>
			</Card>
		</div>
	);
}

function DetailItem({
	label,
	value,
	multiline,
}: {
	label: string;
	value: string;
	multiline?: boolean;
}) {
	return (
		<div>
			<p className='text-xs font-semibold text-muted-foreground'>{label}</p>
			<p className={multiline ? 'whitespace-pre-wrap mt-1' : 'mt-1'}>{value}</p>
		</div>
	);
}
