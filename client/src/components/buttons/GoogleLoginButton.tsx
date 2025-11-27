import axiosInstance from '@/api/axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export default function GoogleLoginButton() {
	const navigate = useNavigate();

	const login = useGoogleLogin({
		onSuccess: async (credentialResponse) => {
			try {
				const { access_token } = credentialResponse;
				const { data } = await axiosInstance.post('/auth/google', {
					token: access_token,
				});

				toast.success(data.message);
				navigate('/');
			} catch (error: any) {
				console.error('Login failed', error);
				toast.error(error.message);
			}
		},
		onError: () =>
			toast.error('Failed to login, accept cookies and please try again'),
	});

	return (
		<Button
			type='button'
			onClick={() => login()}
			variant='outline'
			className='form-button-google w-full'
		>
			<img src='/images/Google_Icon.png' alt='Google' className='size-4' />
			Continue with Google
		</Button>
	);
}
