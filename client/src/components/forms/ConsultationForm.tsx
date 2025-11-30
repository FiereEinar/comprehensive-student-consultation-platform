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
import { DatePicker } from '../DatePicker';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { useState } from 'react';
import InstructorAvailabilities from '../InstructorAvailabilities';
import { useUserStore } from '@/stores/user';
import _ from 'lodash';
import { Plus } from 'lucide-react';
import { Separator } from '@radix-ui/react-separator';
import { queryClient } from '@/main';
import SearchableSelect from '../SearchableSelect';
import HasPermission from '../HasPermission';

export type ConsultationFormValues = z.infer<typeof createConsultationSchema>;

const purposes = ['Grade Consultation', 'Capstone Consultation', 'Other'];

type ConsultationFormProps = {
	title?: string;
};

export default function ConsultationForm({ title }: ConsultationFormProps) {
	const [selectedPurpose, setSelectedPurpose] = useState<string>('');

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
			sectonCode: '',
			subjectCode: '',
		},
	});

	const selectedStudent = watch('student');
	const selectedInstructor = watch('instructor');

	const onSubmit = async (formData: ConsultationFormValues) => {
		try {
			const payload = {
				...formData,
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
				<DialogContent className='sm:max-w-[550px]'>
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

							{/* Select purpose field */}
							<Controller
								name='purpose'
								control={control}
								render={({ field, fieldState }) => (
									<Select
										onValueChange={(value) => {
											field.onChange(value);
											setSelectedPurpose(value);
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
												<SelectLabel>Available Purpose</SelectLabel>
												{purposes.map((purpose) => (
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
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Select>
								)}
							/>
							{/* END */}

							{selectedPurpose &&
								selectedPurpose !== 'Capstone Consultation' && (
									<div className='flex gap-4'>
										{/* SECTION CODE */}
										<Controller
											name='subjectCode'
											control={control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<FieldLabel htmlFor={field.name}>
														Subject Code
													</FieldLabel>
													<Input
														{...field}
														id={field.name}
														aria-invalid={fieldState.invalid}
														placeholder='IT101'
													/>
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
													)}
												</Field>
											)}
										/>
										{/* END SECTION CODE */}

										{/* SECTION CODE */}
										<Controller
											name='sectonCode'
											control={control}
											render={({ field, fieldState }) => (
												<Field data-invalid={fieldState.invalid}>
													<FieldLabel htmlFor={field.name}>
														Section Code
													</FieldLabel>
													<Input
														{...field}
														id={field.name}
														aria-invalid={fieldState.invalid}
														placeholder='T108'
													/>
													{fieldState.invalid && (
														<FieldError errors={[fieldState.error]} />
													)}
												</Field>
											)}
										/>
										{/* END SECTION CODE */}
									</div>
								)}

							{/* DESCRIPTION */}
							<Controller
								name='description'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Description</FieldLabel>
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
								<Field>
									<FieldLabel>Instructor</FieldLabel>
									<SearchableSelect
										placeholder='Select Instructor'
										role='instructor'
										value={selectedInstructor}
										onChange={(val) => {
											setValue('instructor', val);
										}}
									/>
								</Field>
							)}
							{/* END */}

							{selectedInstructor && selectedInstructor !== '' && (
								<div className='text-xs text-muted-foreground px-2'>
									<InstructorAvailabilities
										viewOnly
										instructorID={selectedInstructor}
									/>
								</div>
							)}

							{/* DATE */}
							<Controller
								name='scheduledAt'
								control={control}
								render={({ field, fieldState }) => (
									<DatePicker field={field} fieldState={fieldState} />
								)}
							/>
							{/* END DATE */}
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
