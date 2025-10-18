import {
	AVAILABLE_DAYS,
	createAvilabilitySchema,
} from '@/lib/schemas/availability.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Field, FieldError } from './ui/field';
import type z from 'zod';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import type { User } from '@/types/user';

type UpdateAvailabilityValues = z.infer<typeof createAvilabilitySchema>;

type UpdateAvailabilityProps = {
	user: User;
};

export default function UpdateAvailability({ user }: UpdateAvailabilityProps) {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(createAvilabilitySchema),
		defaultValues: {
			day: '',
			startTime: '10:30',
			endTime: '12:00',
			slots: '1',
		},
	});

	const onSubmit = async (formData: UpdateAvailabilityValues) => {
		try {
			if (!user || user.role !== 'instructor') {
				toast.error('You are not an instructor');
				return;
			}

			const { data } = await axiosInstance.put(
				`/user/${user._id}/availability`,
				formData
			);

			toast.success(data.message);
		} catch (error: any) {
			toast.error(error.message ?? 'Failed to update availability');
		}
	};

	return (
		<form
			id='create-availability-form'
			onSubmit={handleSubmit(onSubmit)}
			className='bg-white rounded-2xl border w-[400px] p-5 space-y-3'
		>
			<h1>Update Availability</h1>
			{/* Select instructor field */}
			<Controller
				name='day'
				control={control}
				render={({ field, fieldState }) => (
					<div>
						<Select
							onValueChange={field.onChange}
							value={field.value}
							defaultValue={field.value}
						>
							<SelectTrigger
								className='w-full cursor-pointer'
								data-invalid={fieldState.invalid}
							>
								<SelectValue placeholder='Select Day' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Days</SelectLabel>
									{AVAILABLE_DAYS.map((day) => (
										<SelectItem
											key={day}
											value={day}
											className='cursor-pointer'
										>
											{day}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Select>
					</div>
				)}
			/>
			{/* END */}

			{/* START TIME */}
			<Controller
				name='startTime'
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<div className='flex flex-col gap-3'>
							<Label htmlFor={field.name} className='px-1'>
								Start Time
							</Label>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								type='time'
								className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</div>
					</Field>
				)}
			/>
			{/* END */}

			{/* END TIME */}
			<Controller
				name='endTime'
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<div className='flex flex-col gap-3'>
							<Label htmlFor={field.name} className='px-1'>
								End Time
							</Label>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								type='time'
								className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</div>
					</Field>
				)}
			/>
			{/* END */}

			{/* SLOTS */}
			<Controller
				name='slots'
				control={control}
				render={({ field, fieldState }) => (
					<Field data-invalid={fieldState.invalid}>
						<div className='flex flex-col gap-3'>
							<Label htmlFor={field.name} className='px-1'>
								Slots Available
							</Label>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
								type='number'
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</div>
					</Field>
				)}
			/>
			{/* END */}

			<div>
				<Button type='submit' form='create-availability-form'>
					Submit
				</Button>
			</div>
		</form>
	);
}
