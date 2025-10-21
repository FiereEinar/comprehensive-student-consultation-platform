import axiosInstance from '@/api/axios';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function GoogleLoginButton() {
	const navigate = useNavigate();

	const handleLoginSuccess = async (credentialResponse: any) => {
		try {
			const { credential } = credentialResponse;

			// Send the Google ID token to your backend
			const res = await axiosInstance.post(
				`${import.meta.env.VITE_API_URL}/auth/google`,
				{
					token: credential,
				}
			);

			console.log('Logged in user:', res.data);
			navigate('/');
		} catch (error: any) {
			console.error('Login failed', error);
			console.error('Failed to login', error);
		}
	};

	return (
		<GoogleLogin
			onSuccess={handleLoginSuccess}
			onError={() => console.log('Login Failed')}
		/>
	);
}
