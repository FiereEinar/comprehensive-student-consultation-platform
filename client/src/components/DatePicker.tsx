import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type {
	ControllerFieldState,
	ControllerRenderProps,
	FieldValues,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FieldError } from './ui/field';

type DatePickerProps<T> = {
	field: ControllerRenderProps<FieldValues & T>;
	fieldState: ControllerFieldState;
};

export function DatePicker<T>({ field, fieldState }: DatePickerProps<T>) {
	const [open, setOpen] = useState(false);

	const handleSelect = (selectedDate?: Date) => {
		if (selectedDate) {
			field.onChange(selectedDate.toISOString());
			setOpen(false);
		}
	};

	const selectedDate = field.value ? new Date(field.value) : undefined;

	return (
		<div className='flex flex-col gap-3'>
			{/* <Label htmlFor='date' className='px-1'>
				Select a date
			</Label> */}
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						id={field.name}
						className={cn(
							'w-48 justify-between font-normal',
							!selectedDate && 'text-muted-foreground',
							fieldState.invalid && 'border-destructive'
						)}
					>
						{selectedDate ? selectedDate.toLocaleDateString() : 'Select date'}
						<ChevronDownIcon />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto overflow-hidden p-0' align='start'>
					<Calendar
						mode='single'
						selected={selectedDate}
						captionLayout='dropdown'
						onSelect={handleSelect}
					/>
				</PopoverContent>
			</Popover>
			{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
		</div>
	);
}
