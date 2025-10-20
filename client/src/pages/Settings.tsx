import InstructorAvailabilities from '@/components/InstructorAvailabilities';
import Header from '@/components/ui/header';
import UpdateAvailability from '@/components/UpdateAvailability';
import { useUserStore } from '@/stores/user';

export default function Settings() {
	const { user } = useUserStore((state) => state);

	return (
		<section className='space-y-5'>
			<Header>Settings</Header>
			{user?.role === 'instructor' && (
				<div className='flex gap-5'>
					<UpdateAvailability user={user} />
					<div className='bg-white rounded-2xl border w-[400px] p-5 space-y-3'>
						<InstructorAvailabilities instructorID={user._id} />
					</div>
				</div>
			)}
		</section>
	);
}
