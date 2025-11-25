import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { queryClient } from '@/main';

type GoogleConnectionData = {
	connected: boolean;
	refreshToken?: string;
	accessToken?: string;
};

export default function GoogleAccountConnection() {
	const { data, isLoading } = useQuery({
		queryKey: ['google-calendar-connection'],
		queryFn: async () => {
			const res = await axiosInstance.get('/auth/google-calendar/status');
			return res.data.data as GoogleConnectionData;
		},
	});

	if (isLoading)
		return (
			<div className='flex justify-center items-center py-10'>
				<Loader2 className='w-6 h-6 animate-spin' />
			</div>
		);

	const handleConnect = () => {
		// Redirect user to backend OAuth route
		window.location.href = `${
			import.meta.env.VITE_API_URL
		}/auth/google-calendar`;
	};

	const handleClearTokens = async () => {
		await axiosInstance.delete('/auth/google-calendar');
		await queryClient.invalidateQueries({
			queryKey: ['google-calendar-connection'],
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Google Calendar Connection</CardTitle>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* STATUS */}
				<div className='flex items-center gap-2'>
					{data?.connected ? (
						<>
							<CheckCircle className='text-green-600 w-5 h-5' />
							<p className='text-green-700 font-medium'>Connected</p>
						</>
					) : (
						<>
							<XCircle className='text-red-600 w-5 h-5' />
							<p className='text-red-700 font-medium'>Not Connected</p>
						</>
					)}
				</div>

				{/* TOKENS DISPLAY */}
				{data?.connected && (
					<div className='bg-gray-100 p-3 rounded-lg text-sm space-y-1'>
						<p className='font-semibold'>Stored Tokens</p>
						<p>
							<b>Access Token:</b>{' '}
							<span className='text-gray-700'>
								{data.accessToken
									? `${data.accessToken.slice(0, 20)}...`
									: 'None'}
							</span>
						</p>
						<p>
							<b>Refresh Token:</b>{' '}
							<span className='text-gray-700'>
								{data.refreshToken
									? `${data.refreshToken.slice(0, 20)}...`
									: 'None'}
							</span>
						</p>
					</div>
				)}

				{/* CONNECT / RECONNECT */}
				<div className='flex gap-2'>
					<Button onClick={handleConnect} variant='default'>
						{data?.connected
							? 'Reconnect Google Calendar'
							: 'Connect Google Calendar'}
					</Button>
					{data?.connected && (
						<Button onClick={handleClearTokens} variant='secondary'>
							Clear Tokens
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
