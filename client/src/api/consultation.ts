import type { Consultation } from '@/types/consultation';
import axiosInstance from './axios';
import type { ConsultationFilterValues } from '@/stores/consultation-filter';

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

export const fetchConsultations = async (
	filters: ConsultationFilterValues
): Promise<Consultation[]> => {
	try {
		let url = `/consultation?`;
		if (filters.status.length > 0) url += `status=${filters.status.join(',')}&`;
		if (filters.search) url += `search=${filters.search}&`;
		if (filters.order) url += `order=${filters.order}&`;
		if (filters.page) url += `page=${filters.page}&`;
		if (filters.pageSize) url += `pageSize=${filters.pageSize}&`;
		if (filters.userID) url += `userID=${filters.userID}&`;

		const { data } = await axiosInstance.get(url);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch consultations', error);
		throw error;
	}
};
