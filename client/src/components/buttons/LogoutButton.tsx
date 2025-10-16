import { Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
	const navigate = useNavigate();

	return (
		<button
			onClick={() => navigate('/login')}
			className='transition-all cursor-pointer w-full p-2 hover:bg-black/20 rounded-md'
		>
			<div className='flex gap-2'>
				<Power />
				<p>Logout</p>
			</div>
		</button>
	);
}
