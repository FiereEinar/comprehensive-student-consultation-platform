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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from '@/components/ui/input-group';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import { Plus } from 'lucide-react';
import type z from 'zod';
import { createSubjectSchema } from '@/lib/schemas/subject.schema';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';

export type CreateSubjectSchema = z.infer<typeof createSubjectSchema>;

type CreateSubjectModalProps = {
	title?: string;
	onSuccess?: () => void;
};

export default function CreateSubjectForm({
	title = 'Add Subject',
	onSuccess,
}: CreateSubjectModalProps) {
	const { control, handleSubmit, reset } = useForm<CreateSubjectSchema>({
		resolver: zodResolver(createSubjectSchema),
		defaultValues: {
			name: '',
			code: '',
			description: '',
		},
	});

	const onSubmit = async (formData: CreateSubjectSchema) => {
		try {
			const { data } = await axiosInstance.post(
				'/instructor/subject',
				formData
			);
			toast.success(data.message);
			reset();
			onSuccess?.();
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SUBJECTS] });
		} catch (error: any) {
			console.error('Failed to create subject', error);
			toast.error(error.response?.data?.message ?? 'Failed to create subject');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='sm' variant='default' className='cursor-pointer'>
					<Plus className='mr-2 h-4 w-4' />
					{title}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create New Subject</DialogTitle>
					<DialogDescription>
						Provide the subject details below.
					</DialogDescription>
				</DialogHeader>
				<form
					id='subject-form'
					onSubmit={handleSubmit(onSubmit)}
					className='grid gap-4'
				>
					{/* NAME */}
					<Controller
						name='name'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Subject Name</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder='e.g. Introduction to Programming'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					{/* CODE */}
					<Controller
						name='code'
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor={field.name}>Subject Code</FieldLabel>
								<Input
									{...field}
									id={field.name}
									placeholder='e.g. CS101'
									className='uppercase'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

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
										placeholder='Optional description about the subject...'
										rows={5}
										className='min-h-24 resize-none'
									/>
									<InputGroupAddon align='block-end'>
										<InputGroupText className='tabular-nums'>
											{field.value?.length ?? 0}/250 characters
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
					<Button type='submit' form='subject-form'>
						Create
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
