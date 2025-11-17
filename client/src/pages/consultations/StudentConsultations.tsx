import { fetchUserConsultations } from '@/api/consultation';
import ConsultationForm from '@/components/forms/ConsultationForm';
import RightSidebar from '@/components/sidebars/RightSidebar';
import ConsultationTabs from '@/components/tabs/ConsultationTabs';
import Header from '@/components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

export default function StudentConsultations() {
	const user = useUserStore((state) => state.user);
	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS, user?._id],
		queryFn: () => fetchUserConsultations(user?._id ?? ''),
	});

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>Student Consultations</Header>
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
				</Tabs>

				<RightSidebar />
			</div>
		</section>
	);
}
