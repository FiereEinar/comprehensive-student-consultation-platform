import type { Consultation } from '@/types/consultation';
import axiosInstance from './axios';

/**
 * query: status = 'pending' | 'accepted' | 'declined' | 'completed' - can be joined with comma
 * limit: number
 */
export const fetchUserConsultations = async (
	userID: string,
	status?: string,
	limit?: number
): Promise<Consultation[]> => {
	try {
		let url = `/user/${userID}/consultation?`;
		if (status) url += `status=${status}&`;
		if (limit) url += `limit=${limit}`;

		const { data } = await axiosInstance.get(url);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch consultations', error);
		throw error;
	}
};

/**
 * query: status = 'pending' | 'accepted' | 'declined' | 'completed' - can be joined with comma
 * limit: number
 */
export const fetchAllConsultations = async (
	status?: string,
	limit?: number
): Promise<Consultation[]> => {
	try {
		let url = `/consultation?`;
		if (status) url += `status=${status}&`;
		if (limit) url += `limit=${limit}`;

		const { data } = await axiosInstance.get(url);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch consultations', error);
		throw error;
	}
};
