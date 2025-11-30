import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useUserStore } from '@/stores/user';
import { NavLink } from 'react-router-dom';
import LogoutButton from '../buttons/LogoutButton';
import {
	adminSidebarLinks,
	instructorSidebarLinks,
	studentSidebarLinks,
	type SidebarNavLinkType,
} from '@/constants';
import { Power, Settings } from 'lucide-react';

export function AppSidebar() {
	const { user } = useUserStore((state) => state);

	function canView(item: SidebarNavLinkType) {
		if (!user) return false;

		// Role check
		if (item.roles && !item.roles.includes(user.role)) {
			return false;
		}

		// If no permissions required, the role check is enough
		if (!item.permissions || item.permissions.length === 0) return true;

		// Permission check (admin only)
		if (user.role !== 'admin') return false;

		const userPerms = user.adminRole?.permissions ?? [];
		return item.permissions.some((p) => userPerms.includes(p));
	}

	return (
		<Sidebar>
			<SidebarHeader>
				<div className='flex gap-2 items-center'>
					<img
						src='/images/academease.png'
						alt='Logo'
						className='size-10 bg-black/90 rounded-md'
					/>

					{/* <IconInnerShadowTop className="!size-5" /> */}
					<p className='text-sm font-semibold'>
						Comprehensive Student Consultation Platform
					</p>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{/* STUDENT SIDEBAR */}
				{user?.role === 'student' && (
					<SidebarGroup>
						<SidebarGroupLabel>Student Panel</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{studentSidebarLinks.map((item) => (
									<SidebarNavLink key={item.title} item={item} />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{/* INSTRUCTOR SIDEBAR */}
				{user?.role === 'instructor' && (
					<SidebarGroup>
						<SidebarGroupLabel>Instructor Panel</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{instructorSidebarLinks.map((item) => (
									<SidebarNavLink key={item.title} item={item} />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{/* ADMIN SIDEBAR */}
				{user?.role === 'admin' && (
					<SidebarGroup>
						<SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{adminSidebarLinks
									.filter((item) => canView(item))
									.map((item) => (
										<SidebarNavLink key={item.title} item={item} />
									))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{/* SETTINGS AND LOGOUT */}
				<SidebarGroup>
					{/* <SidebarGroupLabel>Instructor Panel</SidebarGroupLabel> */}
					<SidebarGroupContent>
						<SidebarMenu>
							{/* <SidebarMenuItem>
								<SidebarMenuButton asChild>
									<ThemeToggle />
								</SidebarMenuButton>
							</SidebarMenuItem> */}
							<SidebarNavLink
								item={{
									title: 'Settings',
									url: '/settings',
									icon: Settings,
								}}
							/>

							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<LogoutButton>
										<Power className='size-4' />
										<span>Logout</span>
									</LogoutButton>

									{/* </NavLink> */}
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

function SidebarNavLink({ item }: { item: SidebarNavLinkType }) {
	return (
		<NavLink
			className={({ isActive }) =>
				`rounded-md ${isActive ? 'bg-custom-primary/20' : ''}`
			}
			to={item.url}
		>
			<SidebarMenuItem>
				<SidebarMenuButton className='transition-all hover:bg-custom-primary/20'>
					<div className='cursor-pointer flex items-center gap-2'>
						<item.icon className='size-5' />
						<span>{item.title}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</NavLink>
	);
}
