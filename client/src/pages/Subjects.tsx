import axiosInstance from '@/api/axios';
import CreateSubjectForm from '@/components/forms/CreateSubjectForm';
import SubjectCard from '@/components/SubjectCard';
import SubjectSheet from '@/components/SubjectSheet';
import Header from '@/components/ui/header';
import { QUERY_KEYS } from '@/constants';
import type { Subject } from '@/types/subject';
import { useQuery } from '@tanstack/react-query';

export default function Subjects() {
	const {
		data: subjects,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.SUBJECTS],
		queryFn: async () => {
			const { data } = await axiosInstance.get('/instructor/subject');
			return data.data as Subject[];
		},
	});

	if (isLoading) return <p className='p-4 text-center'>Loading subjects...</p>;
	if (error)
		return (
			<p className='p-4 text-center text-red-500'>Failed to load subjects</p>
		);

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<Header size='md'>My Subjects</Header>
				<CreateSubjectForm />
			</div>

			{/* Subjects Grid */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{subjects?.length ? (
					subjects.map((subject) => (
						<SubjectSheet
							key={subject._id}
							subject={subject}
							trigger={
								<div>
									<SubjectCard subject={subject} />
								</div>
							}
						/>
					))
				) : (
					<p className='col-span-full text-center text-gray-500'>
						No subjects found.
					</p>
				)}
			</div>
		</div>
	);
}
