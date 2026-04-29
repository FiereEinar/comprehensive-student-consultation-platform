import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Edit, LogIn, LogOut, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { Subject } from '@/types/subject';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';

type SubjectCardProps = {
	subject: Subject;
};

export default function SubjectCard({ subject }: SubjectCardProps) {
	const { user } = useUserStore((state) => state);

	const isTeaching = subject.instructors?.some(
		(inst) => inst._id === user?._id
	);

	const onDelete = async () => {
		try {
			await axiosInstance.delete(`/subject/${subject._id}`);
			toast.success('Subject deleted successfully!');
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error) {
			console.error('Failed to delete subject', error);
			toast.error('Failed to delete subject');
		}
	};

	const onToggleInstructor = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			const { data } = await axiosInstance.post(
				`/subject/${subject._id}/toggle-instructor`
			);
			toast.success(data.message);
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error) {
			console.error('Failed to toggle instructor', error);
			toast.error('Failed to update subject assignment');
		}
	};

	return (
		<Card className='hover:shadow-md transition-shadow'>
			<CardHeader className='flex flex-row gap-5 justify-start items-center'>
				<BookOpen className='size-6 text-gray-400' />

				<div className='flex-1'>
					<div className='flex items-center gap-2'>
						<CardTitle className='text-base font-semibold'>
							{subject.name}
						</CardTitle>
						{isTeaching && (
							<span className='bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-semibold'>
								Teaching
							</span>
						)}
					</div>
					<p className='text-sm text-gray-500'>{subject.code}</p>
				</div>
			</CardHeader>

			<CardContent className='space-y-3 pb-2'>
				<div className='flex flex-wrap gap-2 text-xs'>
					<span className='bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium'>
						SY {subject.schoolYear}
					</span>
					<span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium'>
						Sem {subject.semester}
					</span>
					<span className='bg-gray-100 text-gray-800 px-2 py-1 rounded-md font-medium'>
						{subject.instructors?.length ?? 0} Instructor{(subject.instructors?.length ?? 0) !== 1 && 's'}
					</span>
				</div>

				{subject.description && (
					<p className='text-sm text-gray-700 line-clamp-2'>
						{subject.description}
					</p>
				)}

				{/* Actions */}
				<div className='flex justify-between items-center pt-2 border-t mt-2'>
					{/* Opt-in / Leave button (instructor only) */}
					{user?.role === 'instructor' && (
						<Button
							variant={isTeaching ? 'outline' : 'default'}
							size='sm'
							className={`flex items-center gap-1 text-xs ${
								isTeaching ? 'text-orange-600 border-orange-300 hover:bg-orange-50' : ''
							}`}
							onClick={onToggleInstructor}
						>
							{isTeaching ? (
								<>
									<LogOut className='w-3 h-3' /> Leave
								</>
							) : (
								<>
									<LogIn className='w-3 h-3' /> Opt In
								</>
							)}
						</Button>
					)}

					{!user?.role || user?.role !== 'instructor' ? <div /> : null}

					<div className='flex gap-1'>
						<Button
							variant='link'
							size='sm'
							className='text-black flex items-center gap-1 text-xs'
						>
							<Edit className='w-4 h-4' /> Edit
						</Button>
						<div onClick={(e) => e.stopPropagation()}>
							<ConfirmDeleteDialog
								trigger={
									<div>
										<Button
											variant='link'
											size='sm'
											className='text-red-500 flex items-center gap-1 text-xs px-2'
										>
											<Trash2 className='w-4 h-4' /> Delete
										</Button>
									</div>
								}
								onConfirm={onDelete}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
