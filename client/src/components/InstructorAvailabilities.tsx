import { fetchAvailabilities } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

type InstructorAvailabilitiesProps = {
	instructorID: string;
};

export default function InstructorAvailabilities({
	instructorID,
}: InstructorAvailabilitiesProps) {
	const {
		data: availabilities,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructorID],
		queryFn: () => fetchAvailabilities(instructorID),
	});

	return (
		<div>
			{/* <div className='bg-white rounded-2xl border w-[400px] p-5 space-y-3'> */}
			{isLoading && <p>Loading availability...</p>}
			{error && <p>Error loading availabilities</p>}
			<p>Available Times:</p>
			<ul className='list-disc pl-5'>
				{availabilities?.map((availability) => (
					<li key={availability._id}>
						{availability.day}: {formatTime(availability.startTime)} -{' '}
						{formatTime(availability.endTime)} ({availability.slots} slots)
					</li>
				))}
			</ul>
		</div>
	);
}
