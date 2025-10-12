import ConsultationForm from '@/components/forms/ConsultationForm';
import Header from '@/components/ui/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StudentConsultations() {
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
					<TabsContent value='Upcoming'>Upcoming</TabsContent>
					<TabsContent value='Requests'>Requests</TabsContent>
				</Tabs>
			</div>
		</section>
	);
}
