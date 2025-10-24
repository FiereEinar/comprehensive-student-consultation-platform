import axiosInstance from '@/api/axios';
import { loginSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type z from 'zod';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import GoogleLoginButton from '../buttons/GoogleLoginButton';
import { useUserStore } from '@/stores/user';
import { useState } from 'react';
import Recaptcha from '../Recaptcha';

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
	const { setUser } = useUserStore((state) => state);
	const navigate = useNavigate();
	const {
		control,
		handleSubmit,
		setError,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
			// institutionalID: '', // keep in comments for future
		},
	});

	const onSubmit = async (formData: LoginFormValues) => {
		try {
			if (!recaptchaToken) {
				// toast.error('Please complete the reCAPTCHA');
				setError('root', { message: 'Please complete the reCAPTCHA' });
				return;
			}

			const { data } = await axiosInstance.post('/auth/login', formData);

			toast.success(data.message);

			setUser(data.data);
			data.data.role === 'instructor'
				? navigate('/instructor/consultation')
				: navigate('/student/consultation');
		} catch (error: any) {
			console.error('Failed to login', error);
			toast.error(error.message ?? 'Failed to login');
		}
	};

	return (
		<Card className='form-card w-full max-w-sm'>
			<CardHeader>
				<CardTitle className='form-title'>Login to your account</CardTitle>
				<CardDescription className='form-description'>
					Fill up the form below to login
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id='login-form'
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'
				>
					{/* keep when we change from email to institutional ID */}
					{/* INSTITUTIONAL ID */}
					{/* <Controller
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
            /> */}

					{/* EMAIL */}
					<Controller
						name='email'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Username</FieldLabel>
								<Input
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									type='email'
									placeholder='juan@gmail.com'
									autoComplete='username'
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

					{/* Extra options */}
					<div className='form-extra flex items-center justify-between text-xs'>
						<label className='form-remember'>
							<input type='checkbox' className='form-checkbox mr-2' />
							Remember me
						</label>
						<a href='/forgot' className='form-link text-purple-500 underline'>
							Forgot password?
						</a>
					</div>

					<div className='flex flex-col justify-center items-center gap-2'>
						<Recaptcha onVerify={setRecaptchaToken} />
						<Button
							type='submit'
							form='login-form'
							className='form-button-primary w-full m-0'
						>
							Login
						</Button>
						<GoogleLoginButton />
						{errors.root && <FieldError errors={[errors.root]} />}
					</div>
				</form>
			</CardContent>
			<CardFooter className='flex-col gap-2'>
				<div className='form-alt-action mt-3 text-center text-sm'>
					Don't have an account?{' '}
					<span
						className='form-link text-purple-500 underline cursor-pointer'
						onClick={() => navigate('/signup')}
					>
						Create account
					</span>
				</div>
				{/* <Button type='submit' form='login-form' className='w-full'>
					Login
				</Button> */}
				{/* <Button variant='outline' className='w-full'>
					Login with Google
				</Button> */}
				{/* <Button
					variant='outline'
					className='form-button-google w-full mt-2 flex items-center justify-center gap-2'
				>
					<img src={googleIcon} alt='Google' className='form-google-icon' />
					Login with Google
				</Button> */}
			</CardFooter>
		</Card>
	);
}
