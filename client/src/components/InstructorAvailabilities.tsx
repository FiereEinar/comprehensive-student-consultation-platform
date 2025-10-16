import { fetchAvailabilities } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { formatTime } from '@/lib/utils';
import type { User } from '@/types/user';
import { useQuery } from '@tanstack/react-query';

type InstructorAvailabilitiesProps = {
	instructor: User;
};

export default function InstructorAvailabilities({
	instructor,
}: InstructorAvailabilitiesProps) {
	const {
		data: availabilities,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructor._id],
		queryFn: () => fetchAvailabilities(instructor._id),
	});

	return (
		<div className='bg-white rounded-2xl border w-[400px] p-5 space-y-3'>
			{isLoading && <p>Loading availabilities...</p>}
			{error && <p>Error loading availabilities</p>}
			{availabilities?.map((availability) => (
				<div key={availability._id} className='p-2'>
					<p>{availability.day}</p>
					<p>
						{formatTime(availability.startTime)} -{' '}
						{formatTime(availability.endTime)}
					</p>
				</div>
			))}
		</div>
	);
}
