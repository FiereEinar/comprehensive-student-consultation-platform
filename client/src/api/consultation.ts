import type { Consultation } from '@/types/consultation';
import axiosInstance from './axios';
import type { ConsultationFilterValues } from '@/stores/consultation-filter';

export const fetchConsultations = async (
	filters: Partial<ConsultationFilterValues>
): Promise<Consultation[]> => {
	try {
		let url = `/consultation?`;
		if (filters.status && filters.status.length > 0)
			url += `status=${filters.status.join(',')}&`;
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
