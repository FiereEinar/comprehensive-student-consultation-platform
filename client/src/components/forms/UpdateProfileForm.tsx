import axiosInstance from '@/api/axios';
import { useUserStore } from '@/stores/user';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { startCase } from 'lodash';

type ProfileFormValues = {
	name: string;
};

export default function UpdateProfileForm() {
	const { user, setUser } = useUserStore((state) => state);

	const {
		register: registerProfile,
		handleSubmit: handleProfileSubmit,
		formState: { isSubmitting: updatingProfile },
	} = useForm<ProfileFormValues>({
		defaultValues: {
			name: startCase(user?.name ?? ''),
		},
	});

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

	return (
		<form onSubmit={handleProfileSubmit(onProfileSubmit)} className='space-y-4'>
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
			<Button size='sm' type='submit' disabled={updatingProfile}>
				{updatingProfile ? 'Saving...' : 'Save Changes'}
			</Button>
		</form>
	);
}
