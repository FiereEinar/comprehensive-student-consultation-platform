import { useUserStore } from '@/stores/user';
import type { Consultation } from '@/types/consultation';
import ConsultationCard from '../ConsultationCard';
import ConsultationSheet from '../ConsultationSheet';

type ConsultationTabsProps = {
	consultations: Consultation[];
	isLoading: boolean;
	error: Error | null;
};

export default function ConsultationTabs({
	consultations,
	isLoading,
	error,
}: ConsultationTabsProps) {
	const { user } = useUserStore((state) => state);

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
						<ConsultationSheet
							key={consultation._id}
							consultation={consultation}
							trigger={
								<div>
									<ConsultationCard
										info={user?.role === 'student' ? 'instructor' : 'student'}
										consultation={consultation}
									/>
								</div>
							}
						/>
					))}
				</>
			)}
		</div>
	);
}
