import { NavLink } from 'react-router-dom';
import type { SidebarNavLink } from './Sidebar';

type SidebarLinkProps = {
	link: SidebarNavLink;
};

export default function SidebarLink({ link }: SidebarLinkProps) {
	return (
		<NavLink
			to={link.href}
			key={link.name}
			className={({ isActive }) =>
				`transition-all w-full p-2 pr-8 hover:bg-black/20 rounded-md ${
					isActive ? 'bg-black/20' : ''
				}`
			}
		>
			<div className='flex gap-2'>
				{link.icon}
				<p className='text-nowrap'>{link.name}</p>
			</div>
		</NavLink>
	);
}
