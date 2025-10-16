import axiosInstance from '@/api/axios';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signupSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import z from 'zod';

export type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
	const navigate = useNavigate();
	const { control, handleSubmit } = useForm<SignupFormValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			name: '',
			institutionalID: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const onSubmit = async (formData: SignupFormValues) => {
		try {
			const { data } = await axiosInstance.post('/auth/signup', formData);

			toast.success(data.message);
			navigate('/login');
		} catch (error: any) {
			console.error('Failed to sign up', error);
			toast.error(error.message ?? 'Failed to sign up');
		}
	};

	return (
		<main className='min-h-screen w-full flex flex-col justify-center items-center'>
			{/* to remove styles of card, add this class to the card "border-none shadow-none bg-transparent" */}
			<Card className='w-full max-w-sm'>
				<CardHeader>
					<CardTitle>Create an your account</CardTitle>
					<CardDescription>
						Fill up the form below to create an account
					</CardDescription>
					<CardAction>
						<Button variant='link'>Login</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					<form
						id='signup-form'
						onSubmit={handleSubmit(onSubmit)}
						className='space-y-4'
					>
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
										placeholder='Enter your ID here'
										autoComplete='off'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* NAME */}
						<Controller
							name='name'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Name</FieldLabel>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder='Juan Dela Cruz'
										autoComplete='off'
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
										aria-invalid={fieldState.invalid}
										type='email'
										placeholder='juan@gmail.com'
										autoComplete='off'
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
										aria-invalid={fieldState.invalid}
										type='password'
										placeholder='********'
										autoComplete='off'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* CONFIRM PASSWORD */}
						<Controller
							name='confirmPassword'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										type='password'
										placeholder='********'
										autoComplete='off'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</form>
				</CardContent>
				<CardFooter className='flex-col gap-2'>
					<Button type='submit' form='signup-form' className='w-full'>
						Login
					</Button>
					<Button variant='outline' className='w-full'>
						Login with Google
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
