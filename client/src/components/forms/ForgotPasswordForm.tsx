import { toast } from 'sonner';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { useState } from 'react';
import axiosInstance from '@/api/axios';

export default function ForgotPasswordForm() {
	const [email, setEmail] = useState<string>('');

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			const { data } = await axiosInstance.post('/auth/forgot-password', {
				email,
			});

			toast.success(data.message);
		} catch (error: any) {
			console.error('Failed to send email', error);
			toast.error(error.message ?? 'Failed to send your email');
		}
	};

	return (
		<Card className='form-card w-full shadow-none rounded-none border-l'>
			<CardHeader>
				<CardTitle className='form-title'>Enter you email</CardTitle>
				<CardDescription className='form-description'>
					We&apos;ll send you an email with a link to reset your password
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id='forgot-password-form'
					onSubmit={onSubmit}
					className='space-y-4'
				>
					{/* EMAIL */}
					<Field>
						<FieldLabel htmlFor='email'>Email</FieldLabel>
						<Input
							id='email'
							type='email'
							placeholder='juan@gmail.com'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</Field>

					<div className='flex flex-col justify-center items-center gap-2'>
						<Button
							type='submit'
							form='forgot-password-form'
							className='form-button-primary w-full m-0'
						>
							Submit
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className='flex-col gap-2'>
				{/* <div className='form-alt-action mt-3 text-center text-sm'>
					Don't have an account?{' '}
					<span
						className='form-link text-purple-500 underline cursor-pointer'
						onClick={() => navigate('/signup')}
					>
						Create account
					</span>
				</div> */}
			</CardFooter>
		</Card>
	);
}
