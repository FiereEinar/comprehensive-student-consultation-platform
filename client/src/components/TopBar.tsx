import { useUserStore } from '@/stores/user';
import { UserRound } from 'lucide-react';
import _ from 'lodash';
import { SidebarTrigger } from './ui/sidebar';
import ProfileSettingsSheet from './ProfileSettingsSheet';

export default function TopBar() {
	const { user } = useUserStore((state) => state);

	return (
		<div className='bg-white p-2 pr-5 w-full flex justify-between items-center'>
			<SidebarTrigger />
			<ProfileSettingsSheet
				trigger={
					<div className='flex items-center text-end gap-2 cursor-pointer '>
						<div className='transition-all hover:text-custom-primary'>
							<p>{_.startCase(user?.name)}</p>
							<p className='text-xs mt-[-5px]'>{user?.role}</p>
						</div>
						{user?.profilePicture ? (
							<img
								src={user?.profilePicture}
								className='w-8 h-8 object-cover rounded-full'
							/>
						) : (
							<div className='rounded-full p-1 border-black border-2'>
								<UserRound />
							</div>
						)}
					</div>
				}
			/>
		</div>
	);
}
