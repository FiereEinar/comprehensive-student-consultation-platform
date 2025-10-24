import { startCase } from 'lodash';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import type { Consultation } from '@/types/consultation';
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
import { Calendar, Clock, UserRound } from 'lucide-react';

type ConsultationSheetProps = {
	consultation: Consultation;
	trigger: React.ReactNode;
};

export default function ConsultationSheet({
	consultation,
	trigger,
}: ConsultationSheetProps) {
	const { student, instructor, title, description, scheduledAt, status } =
		consultation;

	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className='text-2xl font-semibold'>
						Consultation Details
					</SheetTitle>
					<SheetDescription>
						View all details of this consultation session.
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='flex flex-col gap-4 p-5 overflow-y-auto'>
					{/* Title and Description */}
					<div className='space-y-1'>
						<p className='text-xl font-semibold'>{startCase(title)}</p>
						<p className='text-sm text-muted-foreground'>{description}</p>
					</div>

					<Separator />

					{/* Consultation Information */}
					<div className='grid grid-cols-2 gap-3'>
						<Card className='col-span-2 py-3'>
							<CardContent className='px-3 flex items-center justify-between'>
								<span className='font-medium'>Status</span>
								<StatusBadge status={status} />
							</CardContent>
						</Card>

						<Card className='py-3'>
							<CardContent className='px-3 flex flex-col items-start justify-between'>
								<div className='flex items-center gap-2'>
									<Calendar className='w-4 h-4 text-muted-foreground' />
									<span className='font-medium'>Date</span>
								</div>
								<p className='text-sm'>
									{format(new Date(scheduledAt), 'MMM dd, yyyy')}
								</p>
							</CardContent>
						</Card>

						<Card className='py-3'>
							<CardContent className='px-3 flex flex-col items-start justify-between'>
								<div className='flex items-center gap-2'>
									<Clock className='w-4 h-4 text-muted-foreground' />
									<span className='font-medium'>Time</span>
								</div>
								<p className='text-sm'>
									{format(new Date(scheduledAt), 'hh:mm a')}
								</p>
							</CardContent>
						</Card>
					</div>

					<Separator />

					{/* Participants */}
					<div className='space-y-3'>
						<p className='font-medium text-sm text-muted-foreground'>
							Participants
						</p>

						<div className='flex flex-col gap-2'>
							<Card className='bg-muted/20 py-2'>
								<CardContent className='px-3 flex items-center gap-3'>
									<UserRound className='w-8 h-8 text-muted-foreground' />
									<div>
										<p className='font-medium'>{startCase(student.name)}</p>
										<p className='text-sm text-muted-foreground'>
											Student - {student.institutionalID}
										</p>
									</div>
								</CardContent>
							</Card>

							<Card className='bg-muted/20 py-2'>
								<CardContent className='px-3 flex items-center gap-3'>
									<UserRound className='w-8 h-8 text-muted-foreground' />
									<div>
										<p className='font-medium'>{startCase(instructor.name)}</p>
										<p className='text-sm text-muted-foreground'>Instructor</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
