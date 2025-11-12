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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupTextarea,
	InputGroupAddon,
	InputGroupText,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import { Plus } from 'lucide-react';
import type z from 'zod';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';
import { createSectionSchema } from '@/lib/schemas/subject.schema';

export type CreateSectionSchema = z.infer<typeof createSectionSchema>;

type AddSectionFormProps = {
	subjectId: string;
	onSuccess?: () => void;
};

export default function AddSectionForm({
	subjectId,
	onSuccess,
}: AddSectionFormProps) {
	const { control, handleSubmit, reset } = useForm<CreateSectionSchema>({
		resolver: zodResolver(createSectionSchema),
		defaultValues: {
			name: '',
			schedule: '',
			students: '',
		},
	});

	const onSubmit = async (formData: CreateSectionSchema) => {
		try {
			// convert comma/newline separated IDs into array
			const studentIDsArray = formData.students
				?.split(/[\n,]+/)
				.map((id) => id.trim())
				.filter(Boolean);

			const payload = {
				name: formData.name,
				subject: subjectId,
				schedule: formData.schedule,
				students: studentIDsArray,
			};

			const { data } = await axiosInstance.post(`/instructor/section`, payload);
			toast.success(data.message);
			reset();
			onSuccess?.();
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.SECTIONS, subjectId],
			});
		} catch (error: any) {
			console.error('Failed to create section', error);
			toast.error(error.message ?? 'Failed to create section');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='sm' variant='outline' className='flex items-center gap-1'>
					<Plus className='h-4 w-4' />
					Add Section
				</Button>
			</DialogTrigger>

			<DialogContent className='sm:max-w-[450px]'>
				<DialogHeader>
					<DialogTitle>Create New Section</DialogTitle>
					<DialogDescription>
						Provide the section details below.
					</DialogDescription>
				</DialogHeader>

				<form
					id='section-form'
					onSubmit={handleSubmit(onSubmit)}
					className='grid gap-4'
				>
					{/* NAME */}
					<Controller
						name='name'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Section Name</FieldLabel>
								<Input {...field} id={field.name} placeholder='e.g. BSIT 3A' />
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* NAME */}
					<Controller
						name='schedule'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Schedule</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder='e.g. MTh 10:00 - 12:00'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* STUDENT IDS */}
					<Controller
						name='students'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>
									Student IDs (comma separated)
								</FieldLabel>
								<InputGroup>
									<InputGroupTextarea
										{...field}
										id={field.name}
										rows={4}
										placeholder='e.g. 2020-1234, 2020-5678, 2021-9012'
										className='resize-none'
									/>
									<InputGroupAddon align='block-end'>
										<InputGroupText className='tabular-nums'>
											{field.value?.split(/[\n,]+/).filter(Boolean).length ?? 0}{' '}
											students
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline'>Cancel</Button>
					</DialogClose>
					<Button type='submit' form='section-form'>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
