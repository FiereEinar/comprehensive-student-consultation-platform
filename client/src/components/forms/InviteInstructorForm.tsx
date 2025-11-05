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

type InviteInstructorValues = z.infer<typeof inviteInstructorSchema>;

export default function InviteInstructorForm() {
	const { control, handleSubmit, reset } = useForm<InviteInstructorValues>({
		resolver: zodResolver(inviteInstructorSchema),
		defaultValues: {
			name: '',
			email: '',
		},
	});

	const onSubmit = async (formData: InviteInstructorValues) => {
		try {
			const { data } = await axiosInstance.post(
				'/auth/invite/instructor',
				formData
			);
			toast.success(data.message);
			reset();
		} catch (error: any) {
			console.error('Failed to send invite', error);
			toast.error(error.message ?? 'Failed to send invitation');
		}
	};

	return (
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
						Send an invitation email for a new instructor to join the platform.
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
					<Button type='submit' form='invite-instructor-form'>
						Send Invitation
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
