import { Button } from '@/components/ui/button';
import Header from '@/components/ui/header';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
	const navigate = useNavigate();

	return (
		<main className='min-h-screen w-full flex flex-col justify-center items-center'>
			<Header>Login</Header>
			<div className='flex gap-2 my-5'>
				<Button onClick={() => navigate('/login')}>Login</Button>
				<Button onClick={() => navigate('/signup')}>Signup</Button>
			</div>
			<Link to='/admin/dashboard'>Home</Link>
		</main>
	);
}
