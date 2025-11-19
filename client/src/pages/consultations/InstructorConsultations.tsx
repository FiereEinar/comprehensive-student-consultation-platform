import { fetchConsultations } from '@/api/consultation';
import LoadingSpinner from '@/components/LoadingSpinner';
import PaginationController from '@/components/PaginationController';
import RightSidebar from '@/components/sidebars/RightSidebar';
import ConsultationTabs from '@/components/tabs/ConsultationTabs';
import Header from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QUERY_KEYS } from '@/constants';
import { useConsultationStateStore } from '@/stores/consultation-filter';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function InstructorConsultations() {
	const user = useUserStore((state) => state.user);
	const { getFilters, page, setPage, setSearch, setStatus, setUserID } =
		useConsultationStateStore((state) => state);

	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS, getFilters()],
		queryFn: () => fetchConsultations(getFilters()),
	});

	useEffect(() => {
		if (user) {
			setUserID(user._id);
		}
	}, [user]);

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>My Consultations</Header>
				{/* <ConsultationForm /> */}
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
									setStatus([]);
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
								value='All'
							>
								All
							</TabsTrigger>
							<TabsTrigger
								onClick={() => {
									setStatus(['accepted', 'completed']);
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
								value='Upcoming'
							>
								Upcoming
							</TabsTrigger>

							<TabsTrigger
								onClick={() => {
									setStatus(['declined', 'pending']);
									setPage(1);
								}}
								className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
								value='Requests'
							>
								Requests
							</TabsTrigger>
						</TabsList>

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
					</div>

					{consultations && (
						<ConsultationTabs
							consultations={consultations}
							isLoading={isLoading}
							error={error}
						/>
					)}

					{isLoading && <LoadingSpinner />}

					{consultations?.length !== 0 && (
						<div className='flex justify-between w-full'>
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

				<RightSidebar />
			</div>
		</section>
	);
}
