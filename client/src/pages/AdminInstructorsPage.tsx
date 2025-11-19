import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { fetchInstructors, fetchInvitations } from '@/api/instructor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import _ from 'lodash';
import InviteInstructorForm from '@/components/forms/InviteInstructorForm';
import Header from '@/components/ui/header';
import UserCard from '@/components/UserCard';

export default function AdminInstructorsPage() {
	const { data: instructors, isLoading: isLoadingInstructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

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
					{/* TAB TRIGGERS INSIDE CARD */}
					<TabsList className='mb-4 bg-white'>
						<TabsTrigger
							value='active'
							className='cursor-pointer data-[state=active]:text-custom-primary 
								data-[state=active]:border-b-custom-primary border-2 
								data-[state=active]:bg-white rounded-none 
								data-[state=active]:shadow-none'
						>
							Active Instructors
						</TabsTrigger>

						<TabsTrigger
							value='pending'
							className='cursor-pointer data-[state=active]:text-custom-primary 
								data-[state=active]:border-b-custom-primary border-2 
								data-[state=active]:bg-white rounded-none 
								data-[state=active]:shadow-none'
						>
							Pending Invitations
						</TabsTrigger>
					</TabsList>

					{/* === ACTIVE INSTRUCTORS === */}
					<TabsContent className='space-y-2' value='active'>
						{isLoadingInstructors ? (
							<div className='flex justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
							</div>
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
							<div className='flex justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
							</div>
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
