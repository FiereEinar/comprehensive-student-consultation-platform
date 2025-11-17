import {
	AVAILABLE_DAYS,
	createAvilabilitySchema,
} from '@/lib/schemas/availability.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Field, FieldError } from './ui/field';
import type z from 'zod';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import axiosInstance from '@/api/axios';
import type { User } from '@/types/user';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';

type UpdateAvailabilityValues = z.infer<typeof createAvilabilitySchema>;

type UpdateAvailabilityProps = {
	user: User;
};

export default function UpdateAvailability({ user }: UpdateAvailabilityProps) {
	const { control, handleSubmit } = useForm({
		resolver: zodResolver(createAvilabilitySchema),
		defaultValues: {
			days: [], // <-- for multi-day
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

			// Count how many days boxes are checked
			// const checkedDaysCount = formData.days.length;

			// Loop over each checked day, submit one schedule per day
			for (const day of formData.days) {
				const availability = {
					day,
					startTime: formData.startTime,
					endTime: formData.endTime,
					slots: formData.slots, // string!
					user: user._id,
				};

				await axiosInstance.post(
					`/user/${user._id}/availability`,
					availability
				);
			}

			toast.success('Availabilities created for all selected days!');
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, user._id],
			});
		} catch (error: any) {
			toast.error(error.message ?? 'Failed to update availability');
		}
	};

	return (
		<form
			id='create-availability-form'
			onSubmit={handleSubmit(onSubmit)}
			className='bg-white rounded-2xl  w-[400px] space-y-3'
		>
			{/* <h1>Update Availability</h1> */}
			{/* Multi-day checkboxes (horizontal, 3-letter/2-letter labels at bottom) */}
			<Controller
				name='days'
				control={control}
				render={({ field, fieldState }) => (
					<div className='flex flex-col gap-3'>
						<Label htmlFor={field.name}>Select Days</Label>
						<div className='flex gap-4 mb-2'>
							{AVAILABLE_DAYS.map((day) => (
								<div key={day} className='flex flex-col items-center'>
									<input
										type='checkbox'
										value={day}
										checked={field.value.includes(day)}
										onChange={(e) => {
											if (e.target.checked) {
												field.onChange([...field.value, day]);
											} else {
												field.onChange(
													field.value.filter((v: string) => v !== day)
												);
											}
										}}
										id={day}
										className='w-8 h-8 custom-purple'
									/>
									<span className='mt-1 text-sm'>
										{day === 'Thursday' ? day.slice(0, 2) : day.slice(0, 1)}
									</span>
								</div>
							))}
						</div>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</div>
				)}
			/>
			{/* END day selection */}

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
				<Button type='submit' size='sm' form='create-availability-form'>
					Submit
				</Button>
			</div>
		</form>
	);
}
