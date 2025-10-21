import ReCAPTCHA from 'react-google-recaptcha';
import { useState } from 'react';
import axiosInstance from '@/api/axios';

type RecaptchaProps = {
	onVerify: (token: string | null) => void;
};

export default function Recaptcha({ onVerify }: RecaptchaProps) {
	const [error, setError] = useState<string | null>(null);

	const onRecaptchaChange = async (value: string | null) => {
		if (value) {
			try {
				await axiosInstance.post('/auth/recaptcha/verify', {
					recaptchaToken: value,
				});
				setError(null);
				onVerify(value);
			} catch (error: any) {
				setError(
					error.response?.data?.message ?? 'reCAPTCHA verification failed'
				);
				onVerify(null);
			}
		}
	};

	return (
		<div className='flex flex-col items-center'>
			<ReCAPTCHA
				sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
				onChange={onRecaptchaChange}
			/>
			{error && <p className='text-xs text-red-500'>{error}</p>}
		</div>
	);
}
