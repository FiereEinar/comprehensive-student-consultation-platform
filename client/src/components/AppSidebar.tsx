import {
	Calendar,
	LayoutDashboard,
	Power,
	Settings,
	type LucideProps,
} from 'lucide-react';

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
import LogoutButton from './buttons/LogoutButton';

type SidebarNavLink = {
	title: string;
	url: string;
	icon: React.ForwardRefExoticComponent<
		Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
	>;
};

const instructorSidebarLinks: SidebarNavLink[] = [
	{
		title: 'Dashboard',
		url: '/instructor/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Consultations',
		url: '/instructor/consultation',
		icon: Calendar,
	},
];

const studentSidebarLinks: SidebarNavLink[] = [
	{
		title: 'Dashboard',
		url: '/student/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Consultations',
		url: '/student/consultation',
		icon: Calendar,
	},
];

export function AppSidebar() {
	const { user } = useUserStore((state) => state);

	return (
		<Sidebar>
			<SidebarHeader>
				<div className='flex gap-2 items-center'>
					<img
						src='/images/logo.png'
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
									// <SidebarMenuItem key={item.title}>
									<SidebarNavLink key={item.title} item={item} />
									// {/* </SidebarMenuItem> */}
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
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<NavLink
												className={({ isActive }) =>
													`transition-all w-full p-2 pr-8 hover:bg-black/20 rounded-md ${
														isActive ? 'bg-black/20' : ''
													}`
												}
												to={item.url}
											>
												<item.icon />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
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

							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<NavLink
										className={({ isActive }) =>
											`transition-all w-full p-2 pr-8 hover:bg-black/20 rounded-md ${
												isActive ? 'bg-black/20' : ''
											}`
										}
										to='/settings'
									>
										<Settings />
										<span>Settings</span>
									</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									{/* <NavLink
												className={({ isActive }) =>
													`transition-all w-full p-2 pr-8 hover:bg-black/20 rounded-md ${
														isActive ? 'bg-black/20' : ''
													}`
												}
												to='/settings'
									> */}
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

function SidebarNavLink({ item }: { item: SidebarNavLink }) {
	return (
		<NavLink
			className={({ isActive }) =>
				`rounded-md ${isActive ? 'bg-custom-primary/20' : ''}`
			}
			to={item.url}
		>
			<SidebarMenuItem>
				<SidebarMenuButton>
					<div className='flex items-center gap-2'>
						<item.icon />
						<span>{item.title}</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</NavLink>
	);
}
