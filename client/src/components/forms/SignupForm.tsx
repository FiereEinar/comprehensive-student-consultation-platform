import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { signupSchema } from '@/lib/schemas/auth.schema';
import type z from 'zod';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import GoogleLoginButtonV2 from '../buttons/GoogleLoginButtonV2';
// import { useState } from 'react';
// import Recaptcha from '../Recaptcha';

export type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
	// const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
	const navigate = useNavigate();
	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<SignupFormValues>({
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
			// if (!recaptchaToken) {
			// 	setError('root', { message: 'Please complete the reCAPTCHA' });
			// 	return;
			// }

			const { data } = await axiosInstance.post('/auth/signup', formData);

			toast.success(data.message);
			navigate('/login');
		} catch (error: any) {
			console.error('Failed to sign up', error);
			// toast.error(error.message ?? 'Failed to sign up');
			setError('root', { message: error.error ?? 'Failed to sign up' });
		}
	};

	return (
		<Card className='form-card w-full shadow-none rounded-none border-l'>
			<CardHeader>
				<CardTitle>Create an your account</CardTitle>
				<CardDescription>
					Fill up the form below to create an account
				</CardDescription>
				{/* <CardAction>
					<Button variant='link' onClick={() => navigate('/login')}>
						Login
					</Button>
				</CardAction> */}
			</CardHeader>
			<CardContent>
				<form
					id='signup-form'
					onSubmit={handleSubmit(onSubmit)}
					className=' space-y-4'
				>
					<div className='flex gap-2'>
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
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
					</div>

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
					{errors.root && (
						<FieldError className='text-center' errors={[errors.root]} />
					)}
					<div className='space-y-2'>
						{/* <Recaptcha onVerify={setRecaptchaToken} /> */}

						<Button
							type='submit'
							form='signup-form'
							className='form-button-primary w-full'
						>
							Signup
						</Button>
						<GoogleLoginButtonV2 />
					</div>
				</form>
			</CardContent>
			<CardFooter className='flex-col gap-2'>
				<div className='form-alt-action mt-2 text-center text-sm'>
					Already have an account?{' '}
					<span
						className='form-link text-purple-500 underline cursor-pointer'
						onClick={() => navigate('/login')}
					>
						Log in
					</span>
				</div>
			</CardFooter>
		</Card>
	);
}
