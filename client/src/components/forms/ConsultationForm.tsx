import { fetchInstructors } from '@/api/instructor';
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
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
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

export type ConsultationFormValues = z.infer<typeof createConsultationSchema>;

type ConsultationFormProps = {
	title?: string;
};

export default function ConsultationForm({ title }: ConsultationFormProps) {
	const { user } = useUserStore((state) => state);
	const [selectedInstructor, setSelectedInstructor] = useState<string>('');
	const { control, handleSubmit } = useForm<ConsultationFormValues>({
		resolver: zodResolver(createConsultationSchema),
		defaultValues: {
			title: '',
			description: '',
			scheduledAt: '',
			instructor: '',
		},
	});

	const { data: instructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

	const onSubmit = async (formData: ConsultationFormValues) => {
		try {
			const { data } = await axiosInstance.post('/consultation', {
				...formData,
				student: user?._id,
			});

			toast.success(data.message);
		} catch (error: any) {
			console.error('Failed to create consultation', error);
			toast.error(error.message ?? 'Failed to create consultation');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='sm' variant='default' className='cursor-pointer'>
					<Plus className='mr-2 h-4 w-4' />
					{title ?? 'Add Consultation'}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Request Consultation</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>
				<form
					id='consultation-form'
					onSubmit={handleSubmit(onSubmit)}
					className='grid gap-4'
				>
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
									placeholder='Grade consultation'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					{/* END TITLE */}

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

					{/* Select instructor field */}
					<Controller
						name='instructor'
						control={control}
						render={({ field, fieldState }) => (
							<Select
								onValueChange={(value) => {
									setSelectedInstructor(value);
									field.onChange(value);
								}}
								value={field.value}
							>
								<SelectTrigger
									className='w-full cursor-pointer'
									data-invalid={fieldState.invalid}
								>
									<SelectValue placeholder='Select Instructor' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Instructors</SelectLabel>
										{instructors &&
											instructors.map((instructor) => (
												<SelectItem
													key={instructor._id}
													value={instructor._id}
													className='cursor-pointer'
												>
													{_.startCase(instructor.name)}
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

					{selectedInstructor && selectedInstructor !== '' && (
						<div className='text-xs text-muted-foreground px-2'>
							<InstructorAvailabilities instructorID={selectedInstructor} />
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
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DialogClose>
					<Button type='submit' form='consultation-form'>
						Submit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
