import { useQuery } from '@tanstack/react-query';
import { fetchAvailabilities, type AvailabilityType } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { useState, useMemo } from 'react';
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CalendarClock, ChevronDown, Clock } from 'lucide-react';
import type { ControllerFieldState, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { FieldError } from './ui/field';

const DAY_MAP: Record<string, number> = {
	Sunday: 0,
	Monday: 1,
	Tuesday: 2,
	Wednesday: 3,
	Thursday: 4,
	Friday: 5,
	Saturday: 6,
};

type GeneratedSlot = {
	date: Date;
	label: string;
	isoString: string;
	dayLabel: string;
	timeLabel: string;
};

function generateSlots(
	availabilities: AvailabilityType[],
	weeksAhead: number
): GeneratedSlot[] {
	const now = new Date();
	const today = startOfDay(now);
	const endDate = addDays(today, weeksAhead * 7);
	const slots: GeneratedSlot[] = [];

	for (const avail of availabilities) {
		const targetDay = DAY_MAP[avail.day];
		if (targetDay === undefined) continue;

		// Parse start time
		const [startH, startM] = avail.startTime.split(':').map(Number);

		// Find every occurrence of this day within the range
		let current = new Date(today);
		// Move to the first occurrence of this weekday
		const currentDay = current.getDay();
		let daysUntil = targetDay - currentDay;
		if (daysUntil < 0) daysUntil += 7;
		current = addDays(current, daysUntil);

		while (current <= endDate) {
			const slotDate = setMinutes(setHours(startOfDay(current), startH), startM);

			// Only include future slots
			if (slotDate > now) {
				const dayLabel = format(slotDate, 'EEE, MMM d, yyyy');
				const timeLabel = `${formatSlotTime(avail.startTime)} – ${formatSlotTime(avail.endTime)}`;

				slots.push({
					date: slotDate,
					label: `${dayLabel} — ${timeLabel}`,
					isoString: slotDate.toISOString(),
					dayLabel,
					timeLabel,
				});
			}

			current = addDays(current, 7);
		}
	}

	// Sort by date ascending
	slots.sort((a, b) => a.date.getTime() - b.date.getTime());
	return slots;
}

function formatSlotTime(time: string): string {
	const [h, m] = time.split(':').map(Number);
	const period = h >= 12 ? 'PM' : 'AM';
	const hour12 = h % 12 || 12;
	return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

type AvailabilitySlotPickerProps<T> = {
	instructorID: string | undefined;
	field: ControllerRenderProps<FieldValues & T>;
	fieldState: ControllerFieldState;
};

export default function AvailabilitySlotPicker<T>({
	instructorID,
	field,
	fieldState,
}: AvailabilitySlotPickerProps<T>) {
	const [weeksAhead, setWeeksAhead] = useState(2);

	const { data: availabilities = [] } = useQuery<AvailabilityType[]>({
		queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructorID],
		queryFn: () => fetchAvailabilities(instructorID || ''),
		enabled: !!instructorID,
	});

	const slots = useMemo(
		() => generateSlots(availabilities, weeksAhead),
		[availabilities, weeksAhead]
	);

	if (!instructorID) {
		return (
			<div className='flex flex-col gap-1.5'>
				<label className='text-sm font-medium'>Schedule</label>
				<div className='flex items-center gap-2 text-sm text-muted-foreground border rounded-lg p-3 bg-muted/30'>
					<CalendarClock className='w-4 h-4' />
					<span>Select an instructor to see available slots</span>
				</div>
			</div>
		);
	}

	if (availabilities.length === 0) {
		return (
			<div className='flex flex-col gap-1.5'>
				<label className='text-sm font-medium'>Schedule</label>
				<div className='flex items-center gap-2 text-sm text-muted-foreground border rounded-lg p-3 bg-muted/30'>
					<CalendarClock className='w-4 h-4' />
					<span>This instructor has not set any availability yet.</span>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-1.5'>
			<label className='text-sm font-medium'>Schedule</label>
			<div className='border rounded-lg overflow-hidden'>
				{/* Scrollable slot list */}
				<div className='max-h-48 overflow-y-auto divide-y'>
					{slots.length === 0 ? (
						<div className='p-3 text-sm text-muted-foreground text-center'>
							No upcoming slots. Try loading more weeks.
						</div>
					) : (
						slots.map((slot) => {
							const isSelected = field.value === slot.isoString;
							return (
								<button
									key={slot.isoString}
									type='button'
									onClick={() => field.onChange(slot.isoString)}
									className={cn(
										'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer hover:bg-accent/50',
										isSelected && 'bg-primary/10 text-primary font-medium'
									)}
								>
									<Clock
										className={cn(
											'w-4 h-4 shrink-0',
											isSelected ? 'text-primary' : 'text-muted-foreground'
										)}
									/>
									<div className='flex flex-col'>
										<span className='font-medium'>{slot.dayLabel}</span>
										<span className='text-xs text-muted-foreground'>
											{slot.timeLabel}
										</span>
									</div>
									{isSelected && (
										<span className='ml-auto text-xs font-semibold text-primary'>
											Selected
										</span>
									)}
								</button>
							);
						})
					)}
				</div>

				{/* Load More */}
				<div className='border-t bg-muted/20 p-2 flex justify-center'>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						className='text-xs gap-1'
						onClick={() => setWeeksAhead((w) => w + 2)}
					>
						<ChevronDown className='w-3.5 h-3.5' />
						Load more slots
					</Button>
				</div>
			</div>
			{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
		</div>
	);
}
