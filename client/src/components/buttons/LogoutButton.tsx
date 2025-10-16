import axiosInstance from '@/api/axios';
import { Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
	const navigate = useNavigate();

	const onLogout = async () => {
		try {
			await axiosInstance.get('/auth/logout');
			navigate('/login');
		} catch (err: any) {
			console.error('Failed to logout');
		}
	};

	return (
		<button
			onClick={onLogout}
			className='transition-all cursor-pointer w-full p-2 hover:bg-black/20 rounded-md'
		>
			<div className='flex gap-2'>
				<Power />
				<p>Logout</p>
			</div>
		</button>
	);
}
