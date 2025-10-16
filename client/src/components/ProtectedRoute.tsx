import { useEffect, useState, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/user';
import axiosInstance from '@/api/axios';
import { useUserStore } from '@/stores/user';

export default function ProtectedRoute({ children }: PropsWithChildren) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const setUser = useUserStore((state) => state.setUser);
	const navigate = useNavigate();

	useEffect(() => {
		(async () => {
			try {
				setTimeout(() => {}, 2000);
				const { data } = await axiosInstance.post<User>('/auth/token/verify');
				setUser(data);
				setIsAuthenticated(true);
			} catch (err: any) {
				setIsAuthenticated(false);
				navigate('/login', { replace: true });
			}
		})();
	}, [navigate]);

	if (!isAuthenticated) {
		return (
			<section className='w-dvw h-dvh flex flex-col justify-center items-center'>
				{/* TODO: add a loading animation */}
				{/* <trefoil
					size='80'
					stroke='4'
					stroke-length='0.15'
					bg-opacity='0.1'
					speed='1.4'
					color='white'
				/> */}
				<p className='text-xl font-bold mt-5'>Authenticating</p>
			</section>
		);
	}

	return children;
}
