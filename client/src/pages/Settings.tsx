import GoogleAccountConnection from '@/components/GoogleAccountConnection';
import NotificationSettings from '@/components/NotificationPreference';
import Header from '@/components/ui/header';
// import { useState } from 'react';
// import InstructorAvailabilities from '@/components/InstructorAvailabilities';
// import UpdateAvailability from '@/components/UpdateAvailability';
// import EditInstructorAvailability from '@/components/forms/EditInstructorAvailability';
// import { useUserStore } from '@/stores/user';

// type AvailabilityType = {
// 	_id: string;
// 	day: string;
// 	startTime: string;
// 	endTime: string;
// 	slots: string;
// 	user: string;
// };

export default function Settings() {
	// const user = useUserStore((state) => state.user);
	// const [editOpen, setEditOpen] = useState(false);
	// const [editAvailability, setEditAvailability] =
	// 	useState<AvailabilityType | null>(null);

	// const handleEdit = (availability: AvailabilityType) => {
	// 	setEditAvailability(availability);
	// 	setEditOpen(true);
	// };

	return (
		<div className='max-w-2xl space-y-5'>
			{/* <div>
				<Header size='md'>Settings</Header>
			</div> */}

			<NotificationSettings />

			<GoogleAccountConnection />

			{/* <Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
				</CardHeader>
				<CardContent>
					<UpdateProfileForm />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
				</CardHeader>
				<CardContent>
					<ResetPasswordForm />
				</CardContent>
			</Card> */}

			{/* {user && user.role === 'instructor' && (
				<Card>
					<CardHeader>
						<CardTitle>Set Your Availability</CardTitle>
					</CardHeader>
					<CardContent>
						<UpdateAvailability user={user} />
						<hr className='my-6' />
						<InstructorAvailabilities
							instructorID={user._id}
							onEdit={handleEdit}
						/>
						<EditInstructorAvailability
							availability={editAvailability}
							open={editOpen}
							onClose={() => setEditOpen(false)}
						/>
					</CardContent>
				</Card>
			)} */}
		</div>
	);
}
