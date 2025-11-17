import ConsultationTabs from '@/components/tabs/ConsultationTabs';
import Header from '@/components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsultationForm from '@/components/forms/ConsultationForm';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchAllConsultations } from '@/api/consultation';
import RightSidebar from '@/components/sidebars/RightSidebar';
// import PaginationController from '@/components/PaginationController';
// import { useConsultationStateStore } from '@/stores/consultation-filter';

export default function AdminConsultations() {
	// const { page, pageSize } = useConsultationStateStore((state) => state);
	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS],
		queryFn: () => fetchAllConsultations(),
	});

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>All Consultations</Header>
				{/* Admin shouldn't create consultations — remove if not needed */}
				<ConsultationForm />
			</div>

			<div className='flex gap-3'>
				<Tabs
					defaultValue='All'
					className='border-2 p-3 bg-white rounded-2xl w-[70%]'
				>
					<TabsList className='self-start bg-white'>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
							value='All'
						>
							All
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
							value='Upcoming'
						>
							Upcoming
						</TabsTrigger>

						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary 
							data-[state=active]:border-b-custom-primary border-2 
							data-[state=active]:bg-white rounded-none 
							data-[state=active]:shadow-none'
							value='Requests'
						>
							Requests
						</TabsTrigger>
					</TabsList>

					{/* === Upcoming (Accepted + Completed) === */}
					<TabsContent value='Upcoming'>
						{consultations && (
							<ConsultationTabs
								consultations={consultations.filter((c) =>
									['accepted', 'completed'].includes(c.status)
								)}
								isLoading={isLoading}
								error={error}
							/>
						)}
					</TabsContent>

					{/* === Requests (Pending + Declined) === */}
					<TabsContent value='Requests'>
						{consultations && (
							<ConsultationTabs
								consultations={consultations.filter((c) =>
									['pending', 'declined'].includes(c.status)
								)}
								isLoading={isLoading}
								error={error}
							/>
						)}
					</TabsContent>

					{/* === All Consultations === */}
					<TabsContent value='All'>
						{consultations && (
							<ConsultationTabs
								consultations={consultations}
								isLoading={isLoading}
								error={error}
							/>
						)}
					</TabsContent>

					{/* <div>
						<PaginationController/>
					</div> */}
				</Tabs>

				{/* Right sidebar */}
				<RightSidebar />
			</div>
		</section>
	);
}
