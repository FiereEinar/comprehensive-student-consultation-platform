import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
	return (
		<div className='min-h-screen w-full flex flex-col items-center justify-center px-6 text-center bg-gray-50'>
			<div className='max-w-md space-y-6'>
				<div className='flex flex-col items-center gap-4'>
					<h1 className='text-7xl font-bold text-gray-900'>404</h1>
					<p className='text-xl font-semibold text-gray-700'>Page Not Found</p>
					<p className='text-sm text-gray-500 max-w-sm'>
						The page you're looking for doesn't exist or may have been moved.
					</p>
				</div>

				<div className='flex flex-col gap-3 mt-6'>
					<Link to='/'>
						<Button className='w-full'>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Go back home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
