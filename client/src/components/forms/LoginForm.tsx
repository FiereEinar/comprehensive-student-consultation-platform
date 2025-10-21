import axiosInstance from '@/api/axios';
import { loginSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type z from 'zod';
import {
	Card,
	CardAction,
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

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
	const { setUser } = useUserStore((state) => state);
	const navigate = useNavigate();
	const { control, handleSubmit } = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (formData: LoginFormValues) => {
		try {
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
		// {/* to remove styles of card, add this class to the card "border-none shadow-none bg-transparent" */ }
		<Card className='w-full max-w-sm'>
			<CardHeader>
				<CardTitle>Login to your account</CardTitle>
				<CardDescription>Fill up the form below to login</CardDescription>
				<CardAction>
					<Button variant='link' onClick={() => navigate('/signup')}>
						Signup
					</Button>
				</CardAction>
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
				</form>
			</CardContent>
			<CardFooter className='flex-col gap-2'>
				<Button type='submit' form='login-form' className='w-full'>
					Login
				</Button>
				{/* <Button variant='outline' className='w-full'>
					Login with Google
				</Button> */}
				<GoogleLoginButton />
			</CardFooter>
		</Card>
	);
}
