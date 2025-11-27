import { clsx, type ClassValue } from 'clsx';
import { format, parse } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatTime = (time: string) => {
	const parsed = parse(time, 'HH:mm', new Date());
	return format(parsed, 'hh:mm a');
};
