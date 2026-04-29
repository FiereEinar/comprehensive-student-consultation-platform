import CreateSubjectForm from '@/components/forms/CreateSubjectForm';
import SubjectCard from '@/components/SubjectCard';
import SubjectSheet from '@/components/SubjectSheet';
import Header from '@/components/ui/header';
import { QUERY_KEYS } from '@/constants';
import type { Subject } from '@/types/subject';
import { useQuery } from '@tanstack/react-query';
import { fetchSubjects } from '@/api/subject';
import { useState } from 'react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import SearchableSelect from '@/components/SearchableSelect';
import { Button } from '@/components/ui/button';

export default function Subjects() {
	const [schoolYear, setSchoolYear] = useState<string>('');
	const [semester, setSemester] = useState<string>('');
	const [instructor, setInstructor] = useState<string>('');

	const {
		data: subjects,
		isLoading,
		error,
	} = useQuery({
		queryKey: [QUERY_KEYS.SUBJECTS, schoolYear, semester, instructor],
		queryFn: async () => {
			const data = await fetchSubjects({
				schoolYear: schoolYear || undefined,
				semester: semester ? Number(semester) : undefined,
				instructor: instructor || undefined,
			});
			return data as Subject[];
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
				<Header size='md'>Subjects</Header>
				<CreateSubjectForm />
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg shadow-sm border'>
				<div className='flex-1 min-w-[200px]'>
					<Select onValueChange={setSchoolYear} value={schoolYear}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select School Year' />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>School Year</SelectLabel>
								{[...Array(5)].map((_, i) => {
									const year = new Date().getFullYear() - i;
									const value = `${year}-${year + 1}`;
									return (
										<SelectItem key={value} value={value}>
											{value}
										</SelectItem>
									);
								})}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className='flex-1 min-w-[200px]'>
					<Select onValueChange={setSemester} value={semester}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select Semester' />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Semester</SelectLabel>
								<SelectItem value='1'>1st Semester</SelectItem>
								<SelectItem value='2'>2nd Semester</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className='flex-1 min-w-[200px]'>
					<SearchableSelect
						placeholder='Filter by Instructor...'
						role='instructor'
						value={instructor}
						onChange={(val) => setInstructor(val)}
					/>
				</div>

				<Button
					variant='outline'
					onClick={() => {
						setSchoolYear('');
						setSemester('');
						setInstructor('');
					}}
				>
					Clear Filters
				</Button>
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
