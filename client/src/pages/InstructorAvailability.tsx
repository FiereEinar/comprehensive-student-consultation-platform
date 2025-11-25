import InstructorAvailabilities from '@/components/InstructorAvailabilities';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/ui/header';
import UpdateAvailability from '@/components/UpdateAvailability';
import EditInstructorAvailability from '@/components/forms/EditInstructorAvailability';
import { useUserStore } from '@/stores/user';
import { useState } from 'react';
import type { User } from '@/types/user';

type AvailabilityType = {
	_id: string;
	day: string;
	startTime: string;
	endTime: string;
	slots: string;
	user: string;
};

export default function InstructorAvailability() {
	const user = useUserStore((state) => state.user);
	const [editOpen, setEditOpen] = useState(false);
	const [editAvailability, setEditAvailability] =
		useState<AvailabilityType | null>(null);

	const handleEdit = (availability: AvailabilityType) => {
		setEditAvailability(availability);
		setEditOpen(true);
	};

	return (
		<section className='space-y-5 w-full'>
			<Header size='md'>My Availabilities</Header>

			{/* Two-column layout */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full'>
				{/* LEFT – Create Availability */}
				<Card className='md:col-span-1 shadow-sm rounded-2xl'>
					<CardContent>
						<h2 className='font-semibold text-lg mb-4'>Add Availability</h2>
						<UpdateAvailability user={user as User} />
					</CardContent>
				</Card>

				{/* RIGHT – List of availabilities */}
				<Card className='md:col-span-2 shadow-sm rounded-2xl'>
					<CardContent>
						<h2 className='font-semibold text-lg mb-4'>Your Schedule</h2>
						<div className='max-h-[420px] overflow-y-auto pr-2'>
							<InstructorAvailabilities
								instructorID={user?._id ?? ''}
								onEdit={handleEdit}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Edit Modal */}
			<EditInstructorAvailability
				availability={editAvailability}
				open={editOpen}
				onClose={() => setEditOpen(false)}
			/>
		</section>
	);
}
