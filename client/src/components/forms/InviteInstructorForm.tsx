import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import { Plus } from 'lucide-react';
import type z from 'zod';
import { inviteInstructorSchema } from '@/lib/schemas/auth.schema';
import { useState } from 'react';
import { queryClient } from '@/main';
import { MODULES, QUERY_KEYS } from '@/constants';
import HasPermission from '../HasPermission';

type InviteInstructorValues = z.infer<typeof inviteInstructorSchema>;

export default function InviteInstructorForm() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { control, handleSubmit, reset } = useForm<InviteInstructorValues>({
		resolver: zodResolver(inviteInstructorSchema),
		defaultValues: {
			name: '',
			email: '',
		},
	});

	const onSubmit = async (formData: InviteInstructorValues) => {
		try {
			setIsLoading(true);
			const { data } = await axiosInstance.post(
				'/auth/invite/instructor',
				formData
			);
			toast.success(data.message);
			reset();
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INVITATIONS],
			});
		} catch (error: any) {
			console.error('Failed to send invite', error);
			toast.error(error.message ?? 'Failed to send invitation');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<HasPermission
			userRole={['admin']}
			permissions={[MODULES.INVITE_INSTRUCTOR_USER]}
		>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant='default' className='cursor-pointer'>
						<Plus className='mr-2 h-4 w-4' />
						Invite Instructor
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Invite Instructor</DialogTitle>
						<DialogDescription>
							Send an invitation email for a new instructor to join the
							platform.
						</DialogDescription>
					</DialogHeader>

					<form
						id='invite-instructor-form'
						onSubmit={handleSubmit(onSubmit)}
						className='grid gap-4'
					>
						{/* NAME */}
						<Controller
							name='name'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
									<Input
										{...field}
										id={field.name}
										placeholder='Enter full name'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* EMAIL */}
						<Controller
							name='email'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
									<Input
										{...field}
										id={field.name}
										placeholder='instructor@example.com'
										type='email'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</form>

					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Cancel</Button>
						</DialogClose>
						<Button
							type='submit'
							disabled={isLoading}
							form='invite-instructor-form'
						>
							Send Invitation
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</HasPermission>
	);
}
