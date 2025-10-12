import type { User } from '@/types/user';
import axiosInstance from './axios';

export const fetchInstructors = async (): Promise<User[]> => {
	try {
		const { data } = await axiosInstance.get('/instructor');

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch instructors', error);
		throw error;
	}
};
