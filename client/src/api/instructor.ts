import type { InstructorAvailability, User } from '@/types/user';
import axiosInstance from './axios';

export const fetchInstructors = async (): Promise<User[]> => {
	try {
		const { data } = await axiosInstance.get('/user?role=instructor');

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch instructors', error);
		throw error;
	}
};

export const fetchAvailabilities = async (
	instructorID: string
): Promise<InstructorAvailability[]> => {
	try {
		if (!instructorID) return [];

		const { data } = await axiosInstance.get(
			`/user/${instructorID}/availability`
		);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch instructors availabilities', error);
		throw error;
	}
};
