import { useConsultationStateStore } from '@/stores/consultation-filter';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import SearchableSelect from './SearchableSelect';
import { useUserStore } from '@/stores/user';
import type { ConsultationStatus } from '@/types/consultation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Filter } from 'lucide-react';

export default function ConsultationFiltersBar() {
	const {
		status,
		setStatus,
		schoolYear,
		setSchoolYear,
		semester,
		setSemester,
		instructorFilter,
		setInstructorFilter,
		search,
		setSearch,
		resetFilters,
	} = useConsultationStateStore((state) => state);

	const { user } = useUserStore((state) => state);

	// Only students and admins need to filter by another instructor
	// Instructors primarily look at their own consultations.
	const showInstructorFilter = user?.role === 'student' || user?.role === 'admin';

	return (
		<div className='flex items-center gap-3 w-full'>
			{/* Search */}
			<div className='w-full max-w-xs'>
				<Input
					placeholder='Search consultations...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{/* Filter Popover */}
			<Popover>
				<PopoverTrigger asChild>
					<Button variant='outline' className='flex items-center gap-2'>
						<Filter className='w-4 h-4' />
						Filters
						{(status.length > 0 || schoolYear || semester || instructorFilter) && (
							<span className='ml-1 flex h-2 w-2 rounded-full bg-custom-primary'></span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-80' align='start'>
					<div className='space-y-4'>
						<h4 className='font-medium text-sm text-muted-foreground uppercase tracking-wider'>Filters</h4>
						
						<div className='grid gap-4'>
							{/* Status */}
							<div className='space-y-1.5'>
								<label className='text-sm font-medium'>Status</label>
								<Select
									onValueChange={(val) => setStatus(val === 'all' ? [] : [val as ConsultationStatus])}
									value={status.length > 0 ? status[0] : 'all'}
								>
									<SelectTrigger className='w-full'>
										<SelectValue placeholder='Status' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Status</SelectLabel>
											<SelectItem value='all'>All</SelectItem>
											<SelectItem value='pending'>Pending</SelectItem>
											<SelectItem value='accepted'>Accepted</SelectItem>
											<SelectItem value='completed'>Completed</SelectItem>
											<SelectItem value='declined'>Declined</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{/* School Year */}
							<div className='space-y-1.5'>
								<label className='text-sm font-medium'>School Year</label>
								<Select onValueChange={setSchoolYear} value={schoolYear}>
									<SelectTrigger className='w-full'>
										<SelectValue placeholder='School Year' />
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

							{/* Semester */}
							<div className='space-y-1.5'>
								<label className='text-sm font-medium'>Semester</label>
								<Select onValueChange={setSemester} value={semester}>
									<SelectTrigger className='w-full'>
										<SelectValue placeholder='Semester' />
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

							{/* Instructor */}
							{showInstructorFilter && (
								<div className='space-y-1.5'>
									<label className='text-sm font-medium'>Instructor</label>
									<SearchableSelect
										placeholder='Filter Instructor'
										role='instructor'
										value={instructorFilter}
										onChange={(val) => setInstructorFilter(val)}
									/>
								</div>
							)}

							{/* Clear Filters */}
							<Button variant='outline' onClick={resetFilters} className='w-full mt-2'>
								Clear All Filters
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
