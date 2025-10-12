import { UserRound } from 'lucide-react';

export default function TopBar() {
	return (
		<div className='bg-white p-2 pr-5 w-full flex justify-end'>
			<div className='flex items-center text-end gap-2'>
				<div>
					<p>Fern Aila Asinero</p>
					<p className='text-xs'>Student</p>
				</div>
				<div className='rounded-full p-1 border-black border-2'>
					<UserRound />
				</div>
			</div>
		</div>
	);
}
