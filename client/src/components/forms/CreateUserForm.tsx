import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/constants';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '../ui/field';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { queryClient } from '@/main';

// Schema for creating a user
const createUserSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	institutionalID: z.string().min(1, 'Institutional ID is required'),
	email: z.email('Invalid email').or(z.literal('')),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	role: z.enum(['admin', 'student', 'instructor'], 'Role is required'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

type CreateUserFormProps = {
	title?: string;
};

export default function CreateUserForm({ title }: CreateUserFormProps) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<CreateUserFormValues>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: '',
			institutionalID: '',
			email: '',
			password: '',
			role: 'student',
		},
	});

	const onSubmit = async (formData: CreateUserFormValues) => {
		try {
			// Remove empty email
			const payload = {
				...formData,
				confirmPassword: formData.password,
			};

			await axiosInstance.post('/user', payload);
			toast.success('User created successfully');
			reset();
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.USERS],
			});
		} catch (error: any) {
			console.error(error);
			toast.error(error.message ?? 'Failed to create user');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='sm' variant='default' className='cursor-pointer'>
					<Plus className='mr-2 h-4 w-4' />
					{title ?? 'Create User'}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>
						Add a new user to the system with their basic information.
					</DialogDescription>
				</DialogHeader>
				<form
					id='create-user-form'
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'
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
									aria-invalid={fieldState.invalid}
									placeholder='John Doe'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* INSTITUTIONAL ID */}
					<Controller
						name='institutionalID'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Institutional ID</FieldLabel>
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder='20210001'
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
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type='email'
									aria-invalid={fieldState.invalid}
									placeholder='john.doe@university.edu'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* PASSWORD */}
					<Controller
						name='password'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Password</FieldLabel>
								<Input
									{...field}
									id={field.name}
									type='password'
									aria-invalid={fieldState.invalid}
									placeholder='Minimum 6 characters'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* ROLE */}
					<Controller
						name='role'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Role</FieldLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger
										className='w-full cursor-pointer'
										data-invalid={fieldState.invalid}
									>
										<SelectValue placeholder='Select Role' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>User Roles</SelectLabel>
											<SelectItem value='student' className='cursor-pointer'>
												Student
											</SelectItem>
											<SelectItem value='instructor' className='cursor-pointer'>
												Instructor
											</SelectItem>
											<SelectItem value='admin' className='cursor-pointer'>
												Admin
											</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={isSubmitting} variant='outline'>
							Cancel
						</Button>
					</DialogClose>
					<Button disabled={isSubmitting} type='submit' form='create-user-form'>
						Create User
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
