import { fetchUserConsultations } from '@/api/consultation';
import { QUERY_KEYS } from '@/constants';
import { useUserStore } from '@/stores/user';
import type { ConsultationStatus } from '@/types/consultation';
import { useQuery } from '@tanstack/react-query';
import ConsultationCard from '../ConsultationCard';

type ConsultationTabsProps = {
	userID: string;
	status: ConsultationStatus;
};

export default function ConsultationTabs({
	userID,
	status,
}: ConsultationTabsProps) {
	const { user } = useUserStore((state) => state);
	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS, status],
		queryFn: () => fetchUserConsultations(userID, status),
	});

	return (
		<div className='space-y-3'>
			{!consultations ? (
				<div className='text-muted-foreground italic p-3'>
					{isLoading && <p>Loading...</p>}
					{error && <p>Error loading consultations</p>}
				</div>
			) : (
				<>
					{!consultations.length && !isLoading && (
						<div className='text-muted-foreground italic p-3'>
							<p>No consultations found</p>
						</div>
					)}
					{consultations?.map((consultation) => (
						<ConsultationCard
							info={user?.role === 'student' ? 'instructor' : 'student'}
							key={consultation._id}
							consultation={consultation}
						/>
					))}
				</>
			)}
		</div>
	);
}
