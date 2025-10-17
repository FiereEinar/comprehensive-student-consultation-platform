import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas/auth.schema';
import type z from 'zod';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
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

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
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
			navigate('/');
		} catch (error: any) {
			console.error('Failed to login', error);
			toast.error(error.message ?? 'Failed to login');
		}
	};

	return (
		<main className='min-h-screen w-full flex flex-col justify-center items-center'>
			{/* to remove styles of card, add this class to the card "border-none shadow-none bg-transparent" */}
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
					<Button variant='outline' className='w-full'>
						Login with Google
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
}
