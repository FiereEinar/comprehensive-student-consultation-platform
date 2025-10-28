import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card';
import axiosInstance from '@/api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';

export default function NewPasswordForm() {
	const { token } = useParams();
	const navigate = useNavigate();
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			if (password !== confirmPassword) {
				toast.error('Passwords do not match');
				return;
			}

			setIsLoading(true);
			const { data } = await axiosInstance.post(
				`/auth/reset-password/${token}`,
				{
					password,
				}
			);

			toast.success(data.message);
			navigate('/login');
		} catch (error: any) {
			console.error('Failed to submit password reset', error);
			toast.error(error.message ?? 'Failed to submit password reset');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className='form-card w-full shadow-none rounded-none border-l'>
			<CardHeader>
				<CardTitle>Enter your new password</CardTitle>
				<CardDescription>This link will expire in 24 hours</CardDescription>
			</CardHeader>
			<CardContent>
				<form id='new-password-form' onSubmit={onSubmit} className=' space-y-4'>
					<Field>
						<FieldLabel htmlFor='password'>New password</FieldLabel>
						<Input
							id='password'
							type='password'
							placeholder='********'
							autoComplete='off'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor='confirm-password'>Confirm password</FieldLabel>
						<Input
							id='confirm-password'
							type='password'
							placeholder='********'
							autoComplete='off'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
					</Field>
					<div className='space-y-2'>
						<Button
							disabled={isLoading}
							type='submit'
							form='new-password-form'
							className='form-button-primary w-full'
						>
							Signup
						</Button>
					</div>
				</form>
			</CardContent>
			<CardFooter className='flex-col gap-2'></CardFooter>
		</Card>
	);
}
