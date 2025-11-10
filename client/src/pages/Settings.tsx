import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import UpdateProfileForm from '@/components/forms/UpdateProfileForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import InstructorAvailabilities from '@/components/InstructorAvailabilities';
import UpdateAvailability from '@/components/UpdateAvailability';

import { useUserStore } from '@/stores/user';

export default function Settings() {

  const user = useUserStore((state) => state.user);

	return (
		<div className='max-w-2xl space-y-5'>
			<div>
				<Header size='md'>Settings</Header>
			</div>

			{/* Profile Info */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
				</CardHeader>
				<CardContent>
					<UpdateProfileForm />
				</CardContent>
			</Card>

			{/* Password Reset */}
			<Card>
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
				</CardHeader>
				<CardContent>
					<ResetPasswordForm />
				</CardContent>
			</Card>
			<Card>
				<CardHeader>
				<CardTitle>Set Your Availability</CardTitle>
				</CardHeader>
				<CardContent>
				{user && user.role === 'instructor' ? (
					<>
					{/* Form for instructor to set availability */}
					<UpdateAvailability user={user} />

					{/* Divider or spacing */}
					<hr className="my-6" />

					{/* Show the instructor's current availabilities */}
					<InstructorAvailabilities instructorID={user._id} />
					</>
				) : (
					<p>You must be an instructor to set or view availabilities.</p>
				)}
				</CardContent>
      		</Card>
		</div>
	);
}
