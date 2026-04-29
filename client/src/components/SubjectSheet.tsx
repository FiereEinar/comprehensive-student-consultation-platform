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
import { User } from 'lucide-react';
import type { Subject } from '@/types/subject';
import { useUserStore } from '@/stores/user';
import { Button } from './ui/button';
import { X, Plus } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import { useState } from 'react';
import { toast } from 'sonner';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { updateSubject } from '@/api/subject';

type SubjectSheetProps = {
	subject: Subject;
	trigger: React.ReactNode;
};

export default function SubjectSheet({ subject, trigger }: SubjectSheetProps) {
	const { name, code, description } = subject;
	const { user } = useUserStore((state) => state);
	const isAdmin = user?.role === 'admin';
	const [selectedInstructorId, setSelectedInstructorId] = useState('');
	const [isUpdating, setIsUpdating] = useState(false);

	const handleAddInstructor = async () => {
		if (!selectedInstructorId) return;
		if (subject.instructors?.some((inst) => inst._id === selectedInstructorId)) {
			toast.error('Instructor is already assigned to this subject');
			return;
		}

		setIsUpdating(true);
		try {
			const newInstructors = [
				...(subject.instructors?.map((i) => i._id) || []),
				selectedInstructorId,
			];
			await updateSubject(subject._id, { instructors: newInstructors as any });
			toast.success('Instructor assigned successfully');
			setSelectedInstructorId('');
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error) {
			console.error(error);
			toast.error('Failed to assign instructor');
		} finally {
			setIsUpdating(false);
		}
	};

	const handleRemoveInstructor = async (instructorId: string) => {
		setIsUpdating(true);
		try {
			const newInstructors = subject.instructors
				?.filter((i) => i._id !== instructorId)
				.map((i) => i._id);
			await updateSubject(subject._id, { instructors: newInstructors as any });
			toast.success('Instructor removed successfully');
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error) {
			console.error(error);
			toast.error('Failed to remove instructor');
		} finally {
			setIsUpdating(false);
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
						View details and assigned instructors for this subject.
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='flex flex-col gap-4 p-5 overflow-y-auto'>
					{/* Subject Information */}
					<div className='space-y-1'>
						<p className='text-xl font-semibold'>{startCase(name)}</p>
						<p className='text-sm text-muted-foreground'>Code: {code}</p>
						{description && (
							<p className='text-sm text-muted-foreground'>{description}</p>
						)}
					</div>

					<div className='flex flex-wrap gap-2 text-xs'>
						<span className='bg-purple-100 text-purple-800 px-2 py-1 rounded-md font-medium'>
							SY {subject.schoolYear}
						</span>
						<span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium'>
							Sem {subject.semester}
						</span>
					</div>

					<Separator />

					{/* Instructors */}
					<div className='space-y-2'>
						<p className='font-medium text-sm text-muted-foreground'>
							Assigned Instructors
						</p>
						{subject.instructors?.length > 0 ? (
							<div className='flex flex-col gap-2'>
								{subject.instructors.map((inst) => (
									<div
										key={inst._id}
										className='flex items-center gap-3 p-2 border rounded-md'
									>
										<User className='w-4 h-4 text-muted-foreground' />
										<div className='flex-1'>
											<p className='text-sm font-medium'>{inst.name}</p>
											<p className='text-xs text-muted-foreground'>
												{inst.email}
											</p>
										</div>
										{isAdmin && (
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive'
												disabled={isUpdating}
												onClick={() => handleRemoveInstructor(inst._id)}
											>
												<X className='w-4 h-4' />
											</Button>
										)}
									</div>
								))}
							</div>
						) : (
							<p className='text-sm text-muted-foreground text-center'>
								No instructors assigned yet.
							</p>
						)}
						
						{isAdmin && (
							<div className='mt-4 flex gap-2'>
								<div className='flex-1'>
									<SearchableSelect
										placeholder='Select instructor to add...'
										role='instructor'
										value={selectedInstructorId}
										onChange={(val) => setSelectedInstructorId(val)}
									/>
								</div>
								<Button
									size='icon'
									onClick={handleAddInstructor}
									disabled={!selectedInstructorId || isUpdating}
								>
									<Plus className='w-4 h-4' />
								</Button>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
