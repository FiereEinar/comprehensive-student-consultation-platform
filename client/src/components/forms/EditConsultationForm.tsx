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
import { Separator } from '@radix-ui/react-separator';
import { queryClient } from '@/main';
import type z from 'zod';
import { createConsultationSchema } from '@/lib/schemas/consultation.schema';
import _ from 'lodash';
import type { Consultation } from '@/types/consultation';
import { Pencil } from 'lucide-react';

export type ConsultationFormValues = z.infer<typeof createConsultationSchema>;

type EditConsultationFormProps = {
	consultation: Consultation; // pass full consultation object
	title?: string;
	trigger?: React.ReactNode;
};

export default function EditConsultationForm({
	consultation,
	trigger,
}: EditConsultationFormProps) {
	const [selectedInstructor] = useState<string>(consultation.instructor._id);
	const [selectedPurpose, setSelectedPurpose] = useState<string>(
		consultation.purpose
	);

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<ConsultationFormValues>({
		resolver: zodResolver(createConsultationSchema),
		defaultValues: {
			title: consultation.title,
			description: consultation.description,
			scheduledAt: consultation.scheduledAt.toString(),
			instructor: consultation.instructor._id,
			purpose: consultation.purpose,
			sectonCode: consultation.sectonCode,
			subjectCode: consultation.subjectCode,
		},
	});

	const { data: instructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

	const onSubmit = async (formData: ConsultationFormValues) => {
		try {
			const { data } = await axiosInstance.patch(
				`/consultation/${consultation._id}`,
				formData
			);

			toast.success(data.message);
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.CONSULTATIONS],
			});
		} catch (error: any) {
			toast.error(error.message ?? 'Failed to update consultation');
		}
	};

	const aquireLock = async () => {
		try {
			const { data } = await axiosInstance.get(
				`/consultation/${consultation._id}/lock`
			);
			if (data.locked && !data.owner) {
				toast.error('Another user is currently editing this consultation.');
			}
		} catch (error: any) {
			console.error('Failed to aquire lock', error);
			toast.error(error.message ?? 'Failed to aquire lock');
		}
	};

	// console.log({ consultation });

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div onClick={aquireLock}>{trigger || <Pencil />}</div>
			</DialogTrigger>

			<DialogContent className='sm:max-w-[550px]'>
				<DialogHeader>
					<DialogTitle>Edit Consultation</DialogTitle>
					<DialogDescription></DialogDescription>
				</DialogHeader>

				<form
					id='consultation-edit-form'
					onSubmit={handleSubmit(onSubmit)}
					className='flex gap-4 justify-between'
				>
					{/* LEFT SIDE */}
					<div className='flex flex-col gap-4 w-full'>
						{/* TITLE */}
						<Controller
							name='title'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Title</FieldLabel>
									<Input {...field} placeholder="We'd like to talk about..." />
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* PURPOSE */}
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
										className='w-full'
										data-invalid={fieldState.invalid}
									>
										<SelectValue placeholder='Select Purpose' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Available Purpose</SelectLabel>
											{[
												'Grade Consultation',
												'Capstone Consultation',
												'Other',
											].map((purpose) => (
												<SelectItem key={purpose} value={purpose}>
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

						{/* SUBJECT + SECTION when applicable */}
						{selectedPurpose !== 'Capstone Consultation' && (
							<div className='flex gap-4'>
								<Controller
									name='subjectCode'
									control={control}
									render={({ field, fieldState }) => (
										<Field>
											<FieldLabel>Subject Code</FieldLabel>
											<Input {...field} placeholder='IT101' />
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								<Controller
									name='sectonCode'
									control={control}
									render={({ field, fieldState }) => (
										<Field>
											<FieldLabel>Section Code</FieldLabel>
											<Input {...field} placeholder='T108' />
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</div>
						)}

						{/* DESCRIPTION */}
						<Controller
							name='description'
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>Description</FieldLabel>
									<InputGroup>
										<InputGroupTextarea
											{...field}
											rows={6}
											className='min-h-24 resize-none'
										/>
										<InputGroupAddon align='block-end'>
											<InputGroupText>
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
					</div>

					<Separator orientation='vertical' className='w-0.5 bg-border' />

					{/* RIGHT SIDE */}
					<div className='flex flex-col gap-4 w-full'>
						{/* INSTRUCTOR (DISABLED) */}
						<Controller
							name='instructor'
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel>Instructor</FieldLabel>
									<Select value={field.value} disabled>
										<SelectTrigger data-invalid={fieldState.invalid}>
											<SelectValue placeholder='Instructor' />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Instructors</SelectLabel>
												{instructors?.map((inst) => (
													<SelectItem key={inst._id} value={inst._id}>
														{_.startCase(inst.name)}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<div className='text-xs text-muted-foreground px-2'>
							<InstructorAvailabilities
								viewOnly
								instructorID={selectedInstructor}
							/>
						</div>

						{/* DATE (DISABLED) */}
						<Controller
							name='scheduledAt'
							control={control}
							render={({ field, fieldState }) => (
								<DatePicker
									field={field}
									fieldState={fieldState}
									isDisabled={true}
								/>
							)}
						/>
					</div>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline' disabled={isSubmitting}>
							Cancel
						</Button>
					</DialogClose>

					<Button
						type='submit'
						form='consultation-edit-form'
						disabled={isSubmitting}
					>
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
