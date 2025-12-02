import axiosInstance from '@/api/axios';
import { loginSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
	const [isLoading, setIsLoading] = useState(false);

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
				setError('root', { message: 'Please complete the reCAPTCHA' });
				return;
			}

			setIsLoading(true);
			const { data } = await axiosInstance.post('/auth/login', formData);

			toast.success(data.message);

			setUser(data.data);
			data.data.role === 'instructor'
				? navigate('/instructor/dashboard')
				: data.data.role === 'student'
				? navigate('/student/dashboard')
				: data.data.role === 'admin'
				? navigate('/admin/dashboard')
				: navigate('/');
		} catch (error: any) {
			setError('root', { message: error.message ?? 'Failed to login' });
			console.error('Failed to login', error);
			// toast.error(error.message ?? 'Failed to login');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className='form-card w-full shadow-none rounded-none border-l'>
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
								<FieldLabel htmlFor={field.name}>Email</FieldLabel>
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
						<Link
							to='/forgot-password'
							className='form-link text-purple-500 underline'
						>
							Forgot password?
						</Link>
					</div>

					{errors.root && (
						<FieldError className='text-center' errors={[errors.root]} />
					)}

					<div className='flex flex-col justify-center items-center gap-2'>
						<Recaptcha onVerify={setRecaptchaToken} />
						<Button
							disabled={isLoading}
							type='submit'
							form='login-form'
							className='form-button-primary w-full m-0'
						>
							Login
						</Button>
						<GoogleLoginButton />
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
			</CardFooter>
		</Card>
	);
}
