import { Link } from 'react-router-dom';
import type { SidebarNavLink } from './Sidebar';

type SidebarLinkProps = {
	link: SidebarNavLink;
};

export default function SidebarLink({ link }: SidebarLinkProps) {
	return (
		<Link
			to={link.href}
			key={link.name}
			className='transition-all w-full p-2 hover:bg-black/20 rounded-md'
		>
			<div className='flex gap-2'>
				{link.icon}
				<p>{link.name}</p>
			</div>
		</Link>
	);
}
