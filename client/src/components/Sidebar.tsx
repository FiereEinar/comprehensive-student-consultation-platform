import { Clock, LayoutDashboard, Settings } from 'lucide-react';
import type { JSX } from 'react';
import SidebarLink from './SidebarLink';
import SidebarHeader from './SidebarHeader';
import LogoutButton from './buttons/LogoutButton';

export type SidebarNavLink = {
	name: string;
	href: string;
	icon: JSX.Element;
};

const sidebarLinks: SidebarNavLink[] = [
	{
		name: '[A] Dashboard',
		href: '/admin/dashboard',
		icon: <LayoutDashboard />,
	},
	{
		name: '[A] Consultations',
		href: '/admin/consultation',
		icon: <Clock />,
	},
	{
		name: '[S] Dashboard',
		href: '/student/dashboard',
		icon: <LayoutDashboard />,
	},
	{
		name: '[S] Consultations',
		href: '/student/consultation',
		icon: <Clock />,
	},
	{
		name: '[I] Dashboard',
		href: '/instructor/dashboard',
		icon: <LayoutDashboard />,
	},
	{
		name: '[I] Consultations',
		href: '/instructor/consultation',
		icon: <Clock />,
	},
];

export default function Sidebar() {
	return (
		<aside className='bg-gradient-to-b from-[#B25DCC] to-[#774FC0] text-white w-[250px] p-5 flex flex-col justify-between min-h-screen'>
			<div className='space-y-5'>
				<SidebarHeader />

				<div className='flex flex-col gap-1'>
					{sidebarLinks.map((link) => (
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
				<LogoutButton />
			</div>
		</aside>
	);
}
