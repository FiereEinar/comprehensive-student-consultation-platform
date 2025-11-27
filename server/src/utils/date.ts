export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const HALF_DAY = 12 * 60 * 60 * 1000;
export const ONE_DAY = 24 * 60 * 60 * 1000;
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
export const ONE_DAY_MS = 1000 * 60 * 60 * 24;
export const ONE_HOUR_MS = 1000 * 60 * 60;
export const ONE_MINUTE_MS = 1000 * 60;

export const thirtyDaysFromNow = () => new Date(Date.now() + THIRTY_DAYS);
export const ONE_HOUR_FROM_NOW = new Date(Date.now() + ONE_HOUR_MS);
export const ONE_DAY_FROM_NOW = new Date(Date.now() + ONE_DAY);

export const getStartAndEndofDay = (date: Date) => {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);

	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return { startOfDay, endOfDay };
};

export type Days = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export const AVAILABLE_DAYS = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
];
