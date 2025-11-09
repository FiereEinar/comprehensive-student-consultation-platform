import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/ui/header';
import UpdateProfileForm from '@/components/forms/UpdateProfileForm';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';

export default function Settings() {
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
		</div>
	);
}
