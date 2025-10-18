import ConsultationForm from '@/components/forms/ConsultationForm';
import StudentConsultationTabs from '@/components/tabs/StudentConsultationTabs';
import Header from '@/components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/stores/user';

export default function StudentConsultations() {
	const user = useUserStore((state) => state.user);

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header>Student Consultations</Header>
				<ConsultationForm />
			</div>
			<div>
				<Tabs defaultValue='Upcoming'>
					<TabsList className='self-end'>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none'
							value='Upcoming'
						>
							Upcoming
						</TabsTrigger>
						<TabsTrigger
							className='cursor-pointer data-[state=active]:text-custom-primary data-[state=active]:border-b-custom-primary border-2 data-[state=active]:bg-custom-secondary rounded-none data-[state=active]:shadow-none data-[state=active]:text-shadow-none'
							value='Requests'
						>
							Requests
						</TabsTrigger>
					</TabsList>
					<TabsContent value='Upcoming'>
						<StudentConsultationTabs
							userID={user?._id ?? ''}
							status='accepted'
						/>
					</TabsContent>
					<TabsContent value='Requests'>
						<StudentConsultationTabs
							userID={user?._id ?? ''}
							status='pending'
						/>
					</TabsContent>
				</Tabs>
			</div>
		</section>
	);
}
