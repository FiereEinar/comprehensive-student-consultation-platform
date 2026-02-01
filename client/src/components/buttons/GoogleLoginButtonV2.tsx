import { Button } from '../ui/button';

export default function GoogleLoginButtonV2() {
	const login = () => {
		// Redirect user to backend OAuth route
		window.location.href = `${
			import.meta.env.VITE_API_URL
		}/auth/google-calendar`;
	};

	return (
		<Button
			type='button'
			onClick={login}
			variant='outline'
			className='form-button-google w-full'
		>
			<img src='/images/Google_Icon.png' alt='Google' className='size-4' />
			Continue with Google
		</Button>
	);
}
