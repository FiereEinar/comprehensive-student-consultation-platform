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
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>My Availabilities</Header>
			</div>

			<div className='flex gap-3'>
				<Card className='w-full'>
					<CardContent>
						<UpdateAvailability user={user as User} />
					</CardContent>
				</Card>
				<Card className='w-full'>
					<CardContent>
						<InstructorAvailabilities
							instructorID={user?._id ?? ''}
							onEdit={handleEdit}
						/>
					</CardContent>
				</Card>
			</div>

			<EditInstructorAvailability
				availability={editAvailability}
				open={editOpen}
				onClose={() => setEditOpen(false)}
			/>
		</section>
	);
}
