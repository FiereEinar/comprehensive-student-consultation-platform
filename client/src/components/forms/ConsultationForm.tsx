import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MODULES, QUERY_KEYS } from '@/constants';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import type z from 'zod';
import { createConsultationSchema } from '@/lib/schemas/consultation.schema';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '../ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from '../ui/input-group';
import AvailabilitySlotPicker from '../AvailabilitySlotPicker';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user';
import _ from 'lodash';
import { Plus } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { queryClient } from '@/main';
import SearchableSelect from '../SearchableSelect';
import HasPermission from '../HasPermission';
import { useQuery } from '@tanstack/react-query';
import { fetchInstructorConsultationPurpose } from '@/api/consultation';
import { fetchSubjects } from '@/api/subject';

export type ConsultationFormValues = z.infer<typeof createConsultationSchema>;

// const purposes = ['Grade Consultation', 'Capstone Consultation', 'Other'];

type ConsultationFormProps = {
	title?: string;
};

export default function ConsultationForm({ title }: ConsultationFormProps) {
	const { user } = useUserStore((state) => state);
	const isStudent = user?.role === 'student';
	const isInstructor = user?.role === 'instructor';
	const isAdmin = user?.role === 'admin';

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { isSubmitting },
	} = useForm<ConsultationFormValues>({
		resolver: zodResolver(createConsultationSchema),
		defaultValues: {
			title: '',
			description: '',
			scheduledAt: '',
			student: '',
			instructor: '',
			purpose: '',
			subjectCode: '',
			schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
			semester: '1',
		},
	});

	const selectedSchoolYear = watch('schoolYear');
	const selectedSemester = watch('semester');

	const { data: subjectsData } = useQuery({
		queryKey: ['subjects', selectedSchoolYear, selectedSemester],
		queryFn: () => fetchSubjects({ schoolYear: selectedSchoolYear, semester: Number(selectedSemester) }),
		enabled: !!selectedSchoolYear && !!selectedSemester,
	});

	const selectedStudent = watch('student');
	const selectedInstructor = watch('instructor');
	const selectedSubjectCode = watch('subjectCode');

	const selectedSubjectData = subjectsData?.find(
		(s: any) => s.code === selectedSubjectCode
	);
	const subjectInstructors = selectedSubjectData?.instructors || [];

	const instructorID = isInstructor ? user._id : selectedInstructor;

	const { data: purpose } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTOR_PURPOSES, instructorID],
		queryFn: () => fetchInstructorConsultationPurpose(instructorID || ''),
	});

	const onSubmit = async (formData: ConsultationFormValues) => {
		try {
			const payload = {
				...formData,
				semester: formData.semester ? Number(formData.semester) : undefined,
				student: isStudent ? user._id : formData.student,
				instructor: isInstructor ? user._id : formData.instructor,
			};

			const { data } = await axiosInstance.post('/consultation', payload);
			toast.success(data.message);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
		} catch (error: any) {
			console.error(error);
			toast.error(error.message ?? 'Failed to create consultation');
		}
	};

	return (
		<HasPermission permissions={[MODULES.CREATE_CONSULTATION]}>
			<Dialog>
				<DialogTrigger asChild>
					<Button size='sm' variant='default' className='cursor-pointer'>
						<Plus className='mr-2 h-4 w-4' />
						{title ?? 'Add Consultation'}
					</Button>
				</DialogTrigger>
				<DialogContent className='min-w-4xl'>
					<DialogHeader>
						<DialogTitle>Request Consultation</DialogTitle>
						<DialogDescription></DialogDescription>
					</DialogHeader>
					<form
						id='consultation-form'
						onSubmit={handleSubmit(onSubmit)}
						className='flex gap-4 justify-between'
					>
						<div className='flex flex-col gap-4 w-full'>
							{/* TITLE */}
							<Controller
								name='title'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Title</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder="We'd like to talk about..."
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							{/* END TITLE */}

							<div className='flex gap-4'>
								{/* SCHOOL YEAR */}
								<Controller
									name='schoolYear'
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>School Year</FieldLabel>
											<Select onValueChange={field.onChange} value={field.value}>
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
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* SEMESTER */}
								<Controller
									name='semester'
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Semester</FieldLabel>
											<Select onValueChange={field.onChange} value={field.value}>
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
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</div>
							
							<div className='flex gap-4'>
								{/* SUBJECT CODE */}
								<Controller
									name='subjectCode'
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid} className="flex-1">
											<FieldLabel htmlFor={field.name}>
												Subject Code
											</FieldLabel>
											<Select 
												onValueChange={(val) => {
													field.onChange(val);
													// Auto-select instructor if possible
													if (subjectsData) {
														const subj = subjectsData.find((s: any) => s.code === val);
														if (subj && subj.instructors && subj.instructors.length === 1) {
															setValue('instructor', subj.instructors[0]._id);
														} else if (subj && subj.instructors && subj.instructors.length > 1) {
															setValue('instructor', ''); // clear so they pick one
														}
													}
												}} 
												value={field.value}
											>
												<SelectTrigger className='w-full'>
													<SelectValue placeholder='Select Subject Code' />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>Subject Code</SelectLabel>
														{subjectsData && subjectsData.map((s: any) => (
															<SelectItem key={s.code} value={s.code}>
																{s.code} - {s.name}
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
								{/* END SUBJECT CODE */}
							</div>

							{/* DESCRIPTION */}
							<Controller
								name='description'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Description (Optional)</FieldLabel>
										<InputGroup>
											<InputGroupTextarea
												{...field}
												id={field.name}
												placeholder='I need help with my grade...'
												rows={6}
												className='min-h-24 resize-none'
												aria-invalid={fieldState.invalid}
											/>
											<InputGroupAddon align='block-end'>
												<InputGroupText className='tabular-nums'>
													{field.value?.length ?? 0}/100 characters
												</InputGroupText>
											</InputGroupAddon>
										</InputGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							{/* END DESCRIPTION */}
						</div>

						<Separator
							orientation='vertical'
							className='h-full w-0.5 bg-border'
						/>

						<div className='flex flex-col gap-4 w-full'>
							{/* Select student field */}
							{(isInstructor || isAdmin) && (
								<Field>
									<FieldLabel>Student</FieldLabel>
									<SearchableSelect
										placeholder='Select Student'
										role='student'
										value={selectedStudent}
										onChange={(val) => {
											setValue('student', val);
										}}
									/>
								</Field>
							)}
							{/* END */}

							{/* Select instructor field */}
							{(isStudent || isAdmin) && (
								<Controller
									name='instructor'
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Instructor</FieldLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
												disabled={!selectedSubjectCode}
											>
												<SelectTrigger className='w-full'>
													<SelectValue
														placeholder={
															selectedSubjectCode
																? 'Select Instructor'
																: 'Select a subject first'
														}
													/>
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>
															{selectedSubjectCode
																? 'Instructors for this subject'
																: 'Select a subject first'}
														</SelectLabel>
														{subjectInstructors.map((inst: any) => (
															<SelectItem key={inst._id} value={inst._id}>
																{_.startCase(inst.name)} ({inst.email})
															</SelectItem>
														))}
													</SelectGroup>
												</SelectContent>
											</Select>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							)}
							{/* END */}

							{/* Select purpose field */}
							<Controller
								name='purpose'
								control={control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel>Purpose</FieldLabel>
										<Select
											onValueChange={(value) => {
												field.onChange(value);
											}}
											value={field.value}
										>
											<SelectTrigger
												className='w-full cursor-pointer'
												data-invalid={fieldState.invalid}
											>
												<SelectValue placeholder='Select Purpose' />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{!purpose ? (
														<SelectLabel>Select an instructor first</SelectLabel>
													) : (
														<SelectLabel>Available Purpose</SelectLabel>
													)}
													{purpose &&
														purpose.purposes.map((purpose: string) => (
															<SelectItem
																key={purpose}
																value={purpose}
																className='cursor-pointer'
															>
																{purpose}
															</SelectItem>
														))}
												</SelectGroup>
											</SelectContent>
										</Select>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							{/* END */}

							{/* SCHEDULE SLOT PICKER */}
							<Controller
								name='scheduledAt'
								control={control}
								render={({ field, fieldState }) => (
									<AvailabilitySlotPicker
										instructorID={instructorID}
										schoolYear={selectedSchoolYear}
										semester={selectedSemester}
										field={field}
										fieldState={fieldState}
									/>
								)}
							/>
							{/* END SCHEDULE */}
						</div>
					</form>
					<DialogFooter>
						<DialogClose asChild>
							<Button disabled={isSubmitting} variant='outline'>
								Cancel
							</Button>
						</DialogClose>
						<Button
							disabled={isSubmitting}
							type='submit'
							form='consultation-form'
						>
							Submit
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</HasPermission>
	);
}
