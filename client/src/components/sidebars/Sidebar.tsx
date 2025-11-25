import { Clock, LayoutDashboard, Power, Settings } from 'lucide-react';
import type { JSX } from 'react';
import { useUserStore } from '@/stores/user';
import SidebarHeader from './SidebarHeader';
import SidebarLink from './SidebarLink';
import LogoutButton from '../buttons/LogoutButton';

export type SidebarNavLink = {
	name: string;
	href: string;
	icon: JSX.Element;
};

const instructorSidebarLinks: SidebarNavLink[] = [
	{
		name: 'Dashboard',
		href: '/instructor/dashboard',
		icon: <LayoutDashboard />,
	},
	{
		name: 'Consultations',
		href: '/instructor/consultation',
		icon: <Clock />,
	},
];

const studentSidebarLinks: SidebarNavLink[] = [
	{
		name: 'Dashboard',
		href: '/student/dashboard',
		icon: <LayoutDashboard />,
	},
	{
		name: 'Consultations',
		href: '/student/consultation',
		icon: <Clock />,
	},
];

export default function Sidebar() {
	const { user } = useUserStore((state) => state);

	return (
		<aside className='bg-gradient-to-b from-[#B25DCC] to-[#774FC0] text-white w-[250px] p-5 flex flex-col justify-between min-h-screen'>
			<div className='space-y-5'>
				<SidebarHeader />

				<div className='flex flex-col gap-1'>
					{user?.role === 'student' &&
						studentSidebarLinks.map((link) => (
							<SidebarLink key={link.name} link={link} />
						))}
					{user?.role === 'instructor' &&
						instructorSidebarLinks.map((link) => (
							<SidebarLink key={link.name} link={link} />
						))}
				</div>
			</div>

			<div className='w-full flex flex-col gap-1'>
				<SidebarLink
					link={{
						name: 'Settings',
						href: '/settings',
						icon: <Settings />,
					}}
				/>
				<LogoutButton>
					<Power />
					<p>Logout</p>
				</LogoutButton>
			</div>
		</aside>
	);
}
