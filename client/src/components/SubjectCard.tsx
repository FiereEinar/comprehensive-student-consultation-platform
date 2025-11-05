import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import type { Subject } from '@/types/subject';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';

type SubjectCardProps = {
	subject: Subject;
};

export default function SubjectCard({ subject }: SubjectCardProps) {
	const onDelete = async () => {
		try {
			await axiosInstance.delete(`/instructor/subject/${subject._id}`);
			toast.success('Subject deleted successfully!');
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error) {
			console.error('Failed to delete subject', error);
			toast.error('Failed to delete subject');
		}
	};

	return (
		<Card className='hover:shadow-md transition-shadow'>
			<CardHeader className='flex flex-row gap-5 justify-start items-center'>
				<BookOpen className='size-6 text-gray-400' />

				<div>
					<CardTitle className='text-base font-semibold'>
						{subject.name}
					</CardTitle>
					<p className='text-sm text-gray-500'>{subject.code}</p>
				</div>
			</CardHeader>

			<CardContent className='space-y-3'>
				{subject.description && (
					<p className='text-sm text-gray-700'>{subject.description}</p>
				)}

				{/* Actions */}
				<div className='flex justify-end gap-2 pt-2'>
					<Button
						variant='link'
						size='sm'
						className='text-black flex items-center gap-1 text-xs'
					>
						<Edit className='w-4 h-4' /> Edit
					</Button>
					<ConfirmDeleteDialog
						trigger={
							<div>
								<Button
									variant='link'
									size='sm'
									className='text-red-500 flex items-center gap-1 text-xs'
								>
									<Trash2 className='w-4 h-4' /> Delete
								</Button>
							</div>
						}
						onConfirm={onDelete}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
