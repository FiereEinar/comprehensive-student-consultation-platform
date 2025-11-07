import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/ui/header';
import { useUserStore } from '@/stores/user';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';

type ProfileFormValues = {
	name: string;
};

type PasswordFormValues = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export default function Settings() {
	const { user, setUser } = useUserStore((state) => state);

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { isSubmitting: updatingProfile },
	} = useForm<ProfileFormValues>({
		defaultValues: {
			name: user?.name ?? '',
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { isSubmitting: updatingPassword },
	} = useForm<PasswordFormValues>();

	const onProfileSubmit = async (formData: ProfileFormValues) => {
		try {
			if (!user) return;

			const { data } = await axiosInstance.patch(
				`/user/${user._id}/name`,
				formData
			);
			toast.success(data.message || 'Profile name udpated successfully');
			setUser(data.data);
		} catch (error: any) {
			console.error('Failed to update name', error);
			toast.error(error.response?.data?.message || 'Failed to update name');
		}
	};

	const onPasswordSubmit = async (formData: PasswordFormValues) => {
		try {
			if (!user) return;

			if (formData.newPassword !== formData.confirmPassword) {
				toast.error('New passwords do not match');
				return;
			}

			const { data } = await axiosInstance.patch(
				`/user/${user._id}/password`,
				formData
			);

			toast.success(data.message || 'Password updated successfully');
		} catch (error: any) {
			console.error('Failed to update password:', error);
			const message =
				error.response?.data?.message ||
				'Failed to update password. Please check your current password.';
			toast.error(message);
		}
	};

	return (
		<div className='max-w-2xl space-y-8'>
			<div>
				<Header size='md'>Settings</Header>
				<p className='text-sm text-gray-500'>
					Manage your account information and password.
				</p>
			</div>

			<Separator />

			{/* Profile Info */}
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleProfileSubmit(onProfileSubmit)}
						className='space-y-4'
					>
						<div className='space-y-2'>
							<Label>Email</Label>
							<Input disabled value={user?.email} readOnly />
						</div>
						<div className='space-y-2'>
							<Label>Institutional ID</Label>
							<Input disabled value={user?.institutionalID} readOnly />
						</div>
						<div className='space-y-2'>
							<Label>Name</Label>
							<Input
								placeholder='Enter your full name'
								{...registerProfile('name', { required: true })}
							/>
						</div>
						<Button type='submit' disabled={updatingProfile}>
							{updatingProfile ? 'Saving...' : 'Save Changes'}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Password Reset */}
			<Card>
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handlePasswordSubmit(onPasswordSubmit)}
						className='space-y-4'
					>
						<div className='space-y-2'>
							<Label>Current Password</Label>
							<Input
								type='password'
								placeholder='Enter current password'
								{...registerPassword('currentPassword', { required: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label>New Password</Label>
							<Input
								type='password'
								placeholder='Enter new password'
								{...registerPassword('newPassword', { required: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label>Confirm New Password</Label>
							<Input
								type='password'
								placeholder='Re-enter new password'
								{...registerPassword('confirmPassword', { required: true })}
							/>
						</div>
						<Button type='submit' disabled={updatingPassword}>
							{updatingPassword ? 'Updating...' : 'Update Password'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
