import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';

type LogoutButtonProps = {
	children?: React.ReactNode;
};

export default function LogoutButton({ children }: LogoutButtonProps) {
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
			<div className='flex gap-2'>{children}</div>
		</button>
	);
}
