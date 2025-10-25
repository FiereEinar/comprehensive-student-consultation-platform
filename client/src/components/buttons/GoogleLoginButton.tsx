import axiosInstance from '@/api/axios';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import googleIcon from '@/assets/Images/Google_Icon.png';

export default function GoogleLoginButton() {
	const navigate = useNavigate();

	// const handleLoginSuccess = async (credentialResponse: any) => {
	// 	try {
	// 		const { access_token } = credentialResponse;
	// 		console.log(credentialResponse);

	// 		// Send the Google ID token to your backend
	// 		const { data } = await axiosInstance.post(
	// 			`${import.meta.env.VITE_API_URL}/auth/google`,
	// 			{
	// 				token: access_token,
	// 			}
	// 		);

	// 		toast.success(data.message);
	// 		navigate('/');
	// 	} catch (error: any) {
	// 		console.error('Login failed', error);
	// 		toast.error('Failed to login', error);
	// 	}
	// };

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
				toast.error('Failed to login', error);
			}
		},
		onError: () =>
			toast.error('Failed to login, accept cookies and please try again'),
	});

	return (
		<Button
			onClick={() => login()}
			variant='outline'
			className='form-button-google w-full'
		>
			<img src={googleIcon} alt='Google' className='size-4' />
			Continue with Google
		</Button>
	);
}
