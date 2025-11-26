import {
	Calendar,
	ClipboardClock,
	Clock4,
	GraduationCap,
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
import LogoutButton from '../buttons/LogoutButton';

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
	{
		title: 'Availability',
		url: '/instructor/availability',
		icon: Clock4,
	},
	// {
	// 	title: 'Subjects',
	// 	url: '/instructor/subject',
	// 	icon: Book,
	// },
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

const adminSidebarLinks: SidebarNavLink[] = [
	{
		title: 'Dashboard',
		url: '/admin/dashboard',
		icon: LayoutDashboard,
	},
	{
		title: 'Consultations',
		url: '/admin/consultation',
		icon: Calendar,
	},
	{
		title: 'Instructors',
		url: '/admin/instructors',
		icon: GraduationCap,
	},
	{
		title: 'Logs',
		url: '/admin/logs',
		icon: ClipboardClock,
	},
];

export function AppSidebar() {
	const { user } = useUserStore((state) => state);

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
								{adminSidebarLinks.map((item) => (
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

function SidebarNavLink({ item }: { item: SidebarNavLink }) {
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
