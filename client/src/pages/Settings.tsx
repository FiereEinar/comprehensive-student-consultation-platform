import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import UpdateProfileForm from '@/components/forms/UpdateProfileForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import UpdateAvailability from '@/components/UpdateAvailability';
import { useUserStore } from '@/stores/user';
import InstructorAvailabilities from '@/components/InstructorAvailabilities';
import type { User } from '@/types/user';

export default function Settings() {
	const { user } = useUserStore((state) => state);

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
					<CardTitle>Update Availability</CardTitle>
				</CardHeader>
				<CardContent>
					<UpdateAvailability user={user as User} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Availability</CardTitle>
				</CardHeader>
				<CardContent>
					<InstructorAvailabilities instructorID={user?._id as string} />
				</CardContent>
			</Card>
		</div>
	);
}
