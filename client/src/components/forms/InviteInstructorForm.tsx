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
import { Plus, X } from 'lucide-react';
import z from 'zod';
import { inviteInstructorSchema } from '@/lib/schemas/auth.schema';
import { useState } from 'react';
import { queryClient } from '@/main';
import { MODULES, QUERY_KEYS } from '@/constants';
import HasPermission from '../HasPermission';

type InviteInstructorValues = z.infer<typeof inviteInstructorSchema>;

export default function InviteInstructorForm() {
	const [emails, setEmails] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { control, handleSubmit, reset, setError } =
		useForm<InviteInstructorValues>({
			resolver: zodResolver(inviteInstructorSchema),
			defaultValues: {
				email: '',
			},
		});

	const onSubmit = async () => {
		try {
			setIsLoading(true);
			const { data } = await axiosInstance.post('/auth/invite/instructor', {
				emails,
			});
			toast.success(data.message);
			reset();
			setEmails([]);
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
				<DialogContent className='sm:max-w-106.25'>
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
						{/* <Controller
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
						/> */}

						{/* EMAIL */}
						<Controller
							name='email'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>
										Email Address{' '}
										<span className='text-xs text-muted-foreground'>
											(Press enter to add more)
										</span>
									</FieldLabel>
									<Input
										{...field}
										id={field.name}
										placeholder='instructor@example.com'
										type='email'
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ',') {
												e.preventDefault();
												const email = field.value?.trim();
												if (email && z.email().safeParse(email).success) {
													setEmails((prev) => [...prev, email]);
													reset({ email: '' });
												} else {
													setError('email', {
														type: 'manual',
														message: 'Invalid email address',
													});
												}
											}
										}}
									/>
									{emails.length > 0 && (
										<div className='mt-2 flex flex-wrap gap-2'>
											{emails.map((email, index) => (
												<span
													key={index}
													className='inline-flex items-center rounded-md bg-custom-primary/20 px-2 py-1 text-xs font-medium text-custom-primary'
												>
													{email}
													<X
														className='ml-2 h-4 w-4 cursor-pointer'
														onClick={() => {
															if (isLoading) return;
															setEmails((prev) =>
																prev.filter((_, i) => i !== index),
															);
														}}
													/>
												</span>
											))}
										</div>
									)}
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</form>

					<DialogFooter>
						<DialogClose asChild>
							<Button disabled={isLoading} variant='outline'>
								Cancel
							</Button>
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
