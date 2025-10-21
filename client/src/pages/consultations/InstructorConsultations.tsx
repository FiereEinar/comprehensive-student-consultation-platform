import ConsultationForm from '@/components/forms/ConsultationForm';
import ConsultationTabs from '@/components/tabs/ConsultationTabs';
import Header from '@/components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user';

export default function InstructorConsultations() {
	const user = useUserStore((state) => state.user);

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header>Instructor Consultations</Header>
				<ConsultationForm />
			</div>
			<div className='flex gap-3'>
				<Tabs
					defaultValue='Upcoming'
					className='border-2 p-3 bg-white rounded-2xl w-[70%]'
				>
					<TabsList className='self-start bg-white'>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-white rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none'
							value='Upcoming'
						>
							Upcoming
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-white rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none'
							value='Requests'
						>
							Requests
						</TabsTrigger>
					</TabsList>
					<TabsContent value='Upcoming'>
						<ConsultationTabs userID={user?._id ?? ''} status='accepted' />
					</TabsContent>
					<TabsContent value='Requests'>
						<ConsultationTabs userID={user?._id ?? ''} status='pending' />
					</TabsContent>
				</Tabs>

				<div className='border-2 p-5 bg-white rounded-2xl w-[30%]'>
					<p>Consultation History</p>
				</div>
			</div>
		</section>
	);
}
