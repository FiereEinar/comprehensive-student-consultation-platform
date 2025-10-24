import axiosInstance from '@/api/axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function GoogleLoginButton() {
	const navigate = useNavigate();

	const handleLoginSuccess = async (credentialResponse: any) => {
		try {
			const { credential } = credentialResponse;

			// Send the Google ID token to your backend
			const { data } = await axiosInstance.post(
				`${import.meta.env.VITE_API_URL}/auth/google`,
				{
					token: credential,
				}
			);

			toast.success(data.message);
			navigate('/');
		} catch (error: any) {
			console.error('Login failed', error);
			toast.error('Failed to login', error);
		}
	};

	return (
		<GoogleLogin
			width={345}
			onSuccess={handleLoginSuccess}
			onError={() => console.log('Login Failed')}
		/>
	);
}
