import ConsultationTabs from '@/components/tabs/ConsultationTabs';
import Header from '@/components/ui/header';
import ConsultationFiltersBar from '@/components/ConsultationFiltersBar';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchConsultations } from '@/api/consultation';
import RightSidebar from '@/components/sidebars/RightSidebar';
import PaginationController from '@/components/PaginationController';
import { useConsultationStateStore } from '@/stores/consultation-filter';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConsultationForm from '@/components/forms/ConsultationForm';

export default function AdminConsultations() {
	const { getFilters, page, setPage } =
		useConsultationStateStore((state) => state);

	const {
		data: consultations,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.CONSULTATIONS, getFilters()],
		queryFn: () => fetchConsultations(getFilters()),
	});

	return (
		<section className='space-y-5'>
			<div className='flex w-full justify-between'>
				<Header size='md'>All Consultations</Header>
				<ConsultationForm />
			</div>

			<div className='flex gap-4 w-full h-full'>
				<div className='flex-1 flex flex-col gap-4'>
					{consultations && (
						<div className='bg-white p-4 rounded-2xl border-2 shadow-sm'>
							<div className='flex justify-between items-center mb-4 gap-4'>
								<ConsultationFiltersBar />

								<div className='flex justify-end ml-auto w-fit'>
									<PaginationController
										currentPage={page}
										nextPage={page + 1}
										prevPage={page - 1}
										setPage={setPage}
										size='sm'
									/>
								</div>
							</div>

							<ConsultationTabs
								consultations={consultations}
								isLoading={isLoading}
								error={error}
							/>

							{isLoading && <LoadingSpinner />}

							{consultations?.length !== 0 && (
								<div className='ml-auto mt-4 w-fit'>
									<PaginationController
										currentPage={page}
										nextPage={page + 1}
										prevPage={page - 1}
										setPage={setPage}
										size='sm'
									/>
								</div>
							)}
						</div>
					)}
				</div>

				<RightSidebar />
			</div>
		</section>
	);
}
