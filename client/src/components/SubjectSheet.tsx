import { startCase } from 'lodash';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Layers3, Trash2 } from 'lucide-react';
import type { Section, Subject } from '@/types/subject';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import axiosInstance from '@/api/axios';
import AddSectionForm from './forms/CreateSectionForm';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { queryClient } from '@/main';
import { toast } from 'sonner';

type SubjectSheetProps = {
	subject: Subject;
	trigger: React.ReactNode;
};

export default function SubjectSheet({ subject, trigger }: SubjectSheetProps) {
	const { name, code, description } = subject;
	const { data: sections, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.SECTIONS, subject._id],
		queryFn: async () => {
			const { data } = await axiosInstance.get(
				`/instructor/section/${subject._id}`
			);
			return data.data as Section[];
		},
	});

	const onDelete = async (sectionID: string) => {
		try {
			await axiosInstance.delete(`/instructor/section/${sectionID}`);
			toast.success('Section deleted successfully!');
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.SECTIONS, subject._id],
			});
		} catch (error) {
			console.error('Failed to delete section', error);
			toast.error('Failed to delete section');
		}
	};

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className='text-2xl font-semibold'>
						Subject Details
					</SheetTitle>
					<SheetDescription>
						View and manage sections for this subject.
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='flex flex-col gap-4 p-5 overflow-y-auto'>
					{/* Subject Information */}
					<div className='space-y-1'>
						<p className='text-xl font-semibold'>{startCase(name)}</p>
						<p className='text-sm text-muted-foreground'>Code: {code}</p>
						<p className='text-sm text-muted-foreground'>{description}</p>
					</div>

					<Separator />

					{/* Section Management */}
					<div className='flex items-center justify-between'>
						<p className='font-medium text-sm text-muted-foreground'>
							Sections
						</p>
						<AddSectionForm subjectId={subject._id} />
					</div>

					{/* List of Sections */}
					<div className='flex flex-col gap-3'>
						{isLoading && (
							<p className='italic text-sm text-muted-foreground text-center'>
								Loading sections...
							</p>
						)}
						{sections?.length === 0 ? (
							<p className='text-sm text-muted-foreground text-center'>
								No sections available for this subject.
							</p>
						) : (
							sections &&
							sections.map((section) => (
								<Card key={section._id} className='py-2'>
									<CardContent className='px-3 flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<Layers3 className='w-5 h-5 text-muted-foreground' />
											<div>
												<p className='font-medium'>{section.name}</p>
												{/* <p className='text-sm text-muted-foreground'>
													{section.yearLevel} • {section.semester}
												</p> */}
											</div>
										</div>

										<div className='flex items-center gap-2'>
											<Button size='icon' variant='outline' className='w-8 h-8'>
												<BookOpen className='w-4 h-4' />
											</Button>

											<ConfirmDeleteDialog
												trigger={
													<Button
														size='icon'
														variant='outline'
														className='text-red-500 hover:text-red-500 w-8 h-8'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												}
												onConfirm={() => onDelete(section._id)}
											/>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
