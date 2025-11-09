import axiosInstance from '@/api/axios';
import { useUserStore } from '@/stores/user';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type PasswordFormValues = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export default function ResetPasswordForm() {
	const { user } = useUserStore((state) => state);

	const {
		register: registerPassword,
		handleSubmit: handlePasswordSubmit,
		formState: { isSubmitting: updatingPassword },
	} = useForm<PasswordFormValues>();

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
			<Button size='sm' type='submit' disabled={updatingPassword}>
				{updatingPassword ? 'Updating...' : 'Update Password'}
			</Button>
		</form>
	);
}
