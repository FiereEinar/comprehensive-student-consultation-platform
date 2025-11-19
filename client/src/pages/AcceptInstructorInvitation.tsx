import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import signupGraphic from '../assets/images/signup_image.jpg';
import axiosInstance from '@/api/axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type z from 'zod';
import { completeInstructorAccountSchema } from '@/lib/schemas/auth.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

type AcceptInstructorInvitationFormValues = z.infer<
	typeof completeInstructorAccountSchema
>;

export default function AcceptInstructorInvitation() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const token = new URLSearchParams(location.search).get('token');
	const { register, handleSubmit } = useForm({
		resolver: zodResolver(completeInstructorAccountSchema),
	});

	const onSubmit = async (data: AcceptInstructorInvitationFormValues) => {
		try {
			setIsLoading(true);
			await axiosInstance.post('/auth/invite/instructor/accept', {
				...data,
				token,
			});
			toast.success('Account created successfully!');
			navigate('/login');
		} catch (error: any) {
			console.error('Failed to create account', error);
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<div className='flex flex-col gap-6'>
					<Card className='overflow-hidden p-0 '>
						<CardContent className='grid p-0 md:grid-cols-2 w-full'>
							<div className='bg-white relative hidden md:block'>
								<img
									src={signupGraphic}
									alt='Signup Illustration'
									className='w-full h-full object-contain object-center dark:brightness-[0.2] dark:grayscale'
								/>
							</div>

							<Card className='form-card w-full shadow-none rounded-none border-l'>
								<CardHeader>
									<CardTitle className='form-title'>
										Complete Your Instructor Account
									</CardTitle>
									<CardDescription className='form-description'>
										Complete your account to become an instructor, link will
										expire in 24 hours
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
										<Input
											{...register('password')}
											placeholder='Set Password'
											type='password'
											required
										/>
										<Input
											{...register('confirmPassword')}
											placeholder='Confirm Password'
											type='password'
											required
										/>
										<Button disabled={isLoading} type='submit'>
											Accept Invitation
										</Button>
									</form>
								</CardContent>
							</Card>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	);
}
