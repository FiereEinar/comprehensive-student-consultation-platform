import { useQuery } from '@tanstack/react-query';
import { MODULES, QUERY_KEYS } from '@/constants';
import { fetchUsers } from '@/api/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/ui/header';
import CreateUserForm from '@/components/forms/CreateUserForm';
import UserCard from '@/components/UserCard';
import { useUserFilterStore } from '@/stores/user-filter';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationController from '@/components/PaginationController';
import { useEffect, useState } from 'react';
import type { User } from '@/types/user';
import UserSheet from '@/components/UserSheet';
import UserRightSidebar from '@/components/sidebars/UserRightSidebar';
import HasPermission from '@/components/HasPermission';

export default function ManageUsersPage() {
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const { getFilters, page, setPage, setSearch, setRole } = useUserFilterStore(
		(state) => state,
	);

	const { data: users, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.USERS, getFilters()],
		queryFn: () => fetchUsers(getFilters()),
	});

	useEffect(() => {
		setRole(null);
		setPage(1);
		setSearch('');
	}, []);

	const handleUserClick = (user: User) => {
		setSelectedUser(user);
		setSheetOpen(true);
	};

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>Manage Users</Header>
				<HasPermission userRole={['admin']} permissions={[MODULES.CREATE_USER]}>
					<CreateUserForm />
				</HasPermission>
			</div>

			<div className='flex gap-3'>
				<Tabs
					defaultValue='All'
					className='border-2 p-3 bg-white rounded-2xl w-[70%]'
				>
					<div className='flex justify-between w-full'>
						<TabsList className='self-start bg-white'>
							<TabsTrigger
								onClick={() => {
									setRole(null);
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary
							data-[state=active]:border-b-custom-primary border-2
							data-[state=active]:bg-white rounded-none
							data-[state=active]:shadow-none'
								value='All'
							>
								All Users
							</TabsTrigger>
							<TabsTrigger
								onClick={() => {
									setRole('student');
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary
							data-[state=active]:border-b-custom-primary border-2
							data-[state=active]:bg-white rounded-none
							data-[state=active]:shadow-none'
								value='Students'
							>
								Students
							</TabsTrigger>
							<TabsTrigger
								onClick={() => {
									setRole('instructor');
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary
							data-[state=active]:border-b-custom-primary border-2
							data-[state=active]:bg-white rounded-none
							data-[state=active]:shadow-none'
								value='Instructors'
							>
								Instructors
							</TabsTrigger>
							<TabsTrigger
								onClick={() => {
									setRole('admin');
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary
							data-[state=active]:border-b-custom-primary border-2
							data-[state=active]:bg-white rounded-none
							data-[state=active]:shadow-none'
								value='Admins'
							>
								Admins
							</TabsTrigger>
						</TabsList>

						<div className='flex gap-2 items-center'>
							<Input
								placeholder='Search users...'
								onChange={(e) => {
									setSearch(e.target.value);
									setPage(1);
								}}
							/>
							<PaginationController
								currentPage={page}
								nextPage={page + 1}
								prevPage={page - 1}
								setPage={setPage}
								size='sm'
							/>
						</div>
					</div>

					<TabsContent className='space-y-2 mt-4' value='All'>
						{isLoading ? (
							<LoadingSpinner />
						) : users?.length === 0 ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No users found
							</p>
						) : (
							<>
								{users &&
									users.map((user) => (
										<div
											key={user._id}
											onClick={() => handleUserClick(user)}
											className='cursor-pointer'
										>
											<UserCard
												name={user.name}
												email={user.email || ''}
												profilePicture={user.profilePicture}
												status={user.archived ? 'archived' : 'active'}
												role={user.role}
											/>
										</div>
									))}
							</>
						)}
					</TabsContent>

					<TabsContent className='space-y-2 mt-4' value='Students'>
						{isLoading ? (
							<LoadingSpinner />
						) : users?.length === 0 ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No students found
							</p>
						) : (
							<>
								{users &&
									users.map((user) => (
										<div
											key={user._id}
											onClick={() => handleUserClick(user)}
											className='cursor-pointer'
										>
											<UserCard
												name={user.name}
												email={user.email || ''}
												profilePicture={user.profilePicture}
												status={user.archived ? 'archived' : 'active'}
											/>
										</div>
									))}
							</>
						)}
					</TabsContent>

					<TabsContent className='space-y-2 mt-4' value='Instructors'>
						{isLoading ? (
							<LoadingSpinner />
						) : users?.length === 0 ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No instructors found
							</p>
						) : (
							<>
								{users &&
									users.map((user) => (
										<div
											key={user._id}
											onClick={() => handleUserClick(user)}
											className='cursor-pointer'
										>
											<UserCard
												name={user.name}
												email={user.email || ''}
												profilePicture={user.profilePicture}
												status={user.archived ? 'archived' : 'active'}
											/>
										</div>
									))}
							</>
						)}
					</TabsContent>

					<TabsContent className='space-y-2 mt-4' value='Admins'>
						{isLoading ? (
							<LoadingSpinner />
						) : users?.length === 0 ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No admins found
							</p>
						) : (
							<>
								{users &&
									users.map((user) => (
										<div
											key={user._id}
											onClick={() => handleUserClick(user)}
											className='cursor-pointer'
										>
											<UserCard
												name={user.name}
												email={user.email || ''}
												profilePicture={user.profilePicture}
												status={user.archived ? 'archived' : 'active'}
											/>
										</div>
									))}
							</>
						)}
					</TabsContent>

					{users && users.length > 0 && (
						<div className='flex justify-between w-full mt-4'>
							<div></div>
							<div>
								<PaginationController
									currentPage={page}
									nextPage={page + 1}
									prevPage={page - 1}
									setPage={setPage}
									size='sm'
								/>
							</div>
						</div>
					)}
				</Tabs>

				<UserRightSidebar />
			</div>

			{/* User Sheet for editing */}
			<UserSheet
				user={selectedUser}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</section>
	);
}
