import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { fetchInvitations } from '@/api/instructor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import _ from 'lodash';
import InviteInstructorForm from '@/components/forms/InviteInstructorForm';
import Header from '@/components/ui/header';
import UserCard from '@/components/UserCard';
import { useUserFilterStore } from '@/stores/user-filter';
import { fetchUsers } from '@/api/user';
import { useEffect, useState } from 'react';
import PaginationController from '@/components/PaginationController';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminInstructorsPage() {
	const [activeTab, setActiveTab] = useState('active');
	const { getFilters, page, setPage, setSearch, setRole } = useUserFilterStore(
		(state) => state
	);

	const { data: instructors, isLoading: isLoadingInstructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS, getFilters()],
		queryFn: () => fetchUsers(getFilters()),
	});

	useEffect(() => {
		setRole('instructor');
	}, []);

	const { data: invitations, isLoading: isLoadingInvitations } = useQuery({
		queryKey: [QUERY_KEYS.INVITATIONS],
		queryFn: fetchInvitations,
	});

	return (
		<div className='space-y-5'>
			<div className='flex justify-between items-center'>
				<Header size='md'>Manage Instructors</Header>
				<InviteInstructorForm />
			</div>

			{/* MAIN CARD WRAPPER */}

			<div>
				<Tabs
					defaultValue='active'
					className='w-full border-2 p-3 bg-white rounded-2xl'
				>
					<div className='flex justify-between w-full'>
						<TabsList className='mb-4 bg-white'>
							<TabsTrigger
								onClick={() => setActiveTab('active')}
								value='active'
								className='cursor-pointer data-[state=active]:text-custom-primary 
								data-[state=active]:border-b-custom-primary border-2 
								data-[state=active]:bg-white rounded-none 
								data-[state=active]:shadow-none'
							>
								Active Instructors
							</TabsTrigger>

							<TabsTrigger
								onClick={() => setActiveTab('pending')}
								value='pending'
								className='cursor-pointer data-[state=active]:text-custom-primary 
								data-[state=active]:border-b-custom-primary border-2 
								data-[state=active]:bg-white rounded-none 
								data-[state=active]:shadow-none'
							>
								Pending Invitations
							</TabsTrigger>
						</TabsList>

						{activeTab === 'active' && (
							<div className='flex gap-2 items-center'>
								<Input
									placeholder='Search'
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
						)}
					</div>

					{/* === ACTIVE INSTRUCTORS === */}
					<TabsContent className='space-y-2' value='active'>
						{isLoadingInstructors ? (
							<LoadingSpinner />
						) : instructors?.length === 0 && !isLoadingInstructors ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No instructors found
							</p>
						) : (
							<>
								{instructors &&
									instructors.map((instructor) => (
										<UserCard
											key={instructor._id}
											name={instructor.name}
											email={instructor.email}
											profilePicture={instructor.profilePicture}
											status='active'
										/>
									))}
							</>
						)}
					</TabsContent>

					{/* === PENDING INVITATIONS === */}
					<TabsContent className='space-y-2' value='pending'>
						{isLoadingInvitations ? (
							<LoadingSpinner />
						) : invitations?.length === 0 && !isLoadingInvitations ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No invitations found
							</p>
						) : (
							<>
								{invitations &&
									invitations.map((invitation) => (
										<UserCard
											key={invitation._id}
											name={invitation.name}
											email={invitation.email}
											status={invitation.status}
											createdAt={invitation.createdAt}
										/>
									))}
							</>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
