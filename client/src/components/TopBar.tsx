import { useUserStore } from '@/stores/user';
import { UserRound } from 'lucide-react';
import _ from 'lodash';

export default function TopBar() {
	const { user } = useUserStore((state) => state);

	return (
		<div className='bg-white p-2 pr-5 w-full flex justify-end'>
			<div className='flex items-center text-end gap-2'>
				<div>
					<p>{_.startCase(user?.name)}</p>
					<p className='text-xs'>{user?.role}</p>
				</div>
				<div className='rounded-full p-1 border-black border-2'>
					<UserRound />
				</div>
			</div>
		</div>
	);
}
