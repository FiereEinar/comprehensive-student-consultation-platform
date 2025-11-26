import { useQuery, useMutation } from '@tanstack/react-query';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/api/axios';
import { queryClient } from '@/main';
import { toast } from 'sonner';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

type AppNotification = {
	_id: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
};

export default function NotificationButton() {
	const { data = [], isLoading } = useQuery({
		queryKey: ['notifications'],
		queryFn: async (): Promise<AppNotification[]> => {
			const res = await axiosInstance.get('/notification');
			return res.data.data;
		},
	});

	const unreadCount = data.filter((n) => !n.isRead).length;

	const markRead = useMutation({
		mutationFn: (id: string) => axiosInstance.patch(`/notification/${id}/read`),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['notifications'] }),
		onError: () => toast.error('Failed to mark notification'),
	});

	const deleteOne = useMutation({
		mutationFn: (id: string) => axiosInstance.delete(`/notification/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
			toast.success('Notification deleted');
		},
		onError: () => toast.error('Failed to delete'),
	});

	const markAll = async () => {
		try {
			await axiosInstance.patch('/notification/mark-all-read');
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		} catch {
			toast.error('Failed to mark all as read');
		}
	};

	const clearRead = async () => {
		try {
			await axiosInstance.delete('/notification/clear-read');
			queryClient.invalidateQueries({ queryKey: ['notifications'] });
		} catch {
			toast.error('Failed to clear notifications');
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant='ghost' className='relative'>
					<Bell className='w-5 h-5' />
					{unreadCount > 0 && (
						<Badge
							variant='destructive'
							className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] rounded-full'
						>
							{unreadCount}
						</Badge>
					)}
				</Button>
			</SheetTrigger>

			<SheetContent side='right' className='w-[420px] p-0 flex flex-col'>
				{/* HEADER */}
				<div className='px-5 py-4 border-b flex items-center justify-between'>
					<SheetHeader>
						<SheetTitle className='text-lg font-semibold'>
							Notifications
						</SheetTitle>
						<SheetDescription></SheetDescription>
					</SheetHeader>

					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='icon'
							onClick={markAll}
							className='rounded-lg'
							aria-label='Mark all'
						>
							<Check className='w-4 h-4' />
						</Button>

						<Button
							variant='ghost'
							size='icon'
							onClick={clearRead}
							className='rounded-lg'
							aria-label='Clear read'
						>
							<Trash2 className='w-4 h-4' />
						</Button>
					</div>
				</div>

				{/* LIST */}
				<div className='flex-1 overflow-y-auto px-4 py-3 space-y-3'>
					{isLoading ? (
						<div className='flex justify-center py-10'>
							<div className='animate-spin w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full'></div>
						</div>
					) : data.length === 0 ? (
						<div className='py-10 text-center text-sm text-muted-foreground'>
							No notifications
						</div>
					) : (
						data.map((n) => (
							<div
								key={n._id}
								className={`border rounded-xl p-4 hover:bg-muted/40 transition flex flex-col gap-2 ${
									!n.isRead ? 'bg-muted/30' : ''
								}`}
							>
								<div className='flex items-start justify-between gap-3'>
									<div className='flex-1'>
										<p className='font-medium text-sm'>{n.title}</p>
										{/* <p className='text-xs text-muted-foreground leading-relaxed'>
											{n.message}
										</p> */}
										<p className='text-[10px] text-muted-foreground mt-1'>
											{formatDistanceToNow(new Date(n.createdAt), {
												addSuffix: true,
											})}
										</p>
									</div>

									<div className='flex items-center gap-1'>
										{!n.isRead && (
											<Button
												variant='ghost'
												size='icon'
												onClick={() => markRead.mutate(n._id)}
												className='rounded-lg'
											>
												<Check className='w-4 h-4' />
											</Button>
										)}

										<Button
											variant='ghost'
											size='icon'
											onClick={() => deleteOne.mutate(n._id)}
											className='rounded-lg text-red-500'
										>
											<X className='w-4 h-4' />
										</Button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
