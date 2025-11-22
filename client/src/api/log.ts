import type { LogFilterValues } from '@/stores/log-filter';
import { RESOURCE_TYPES, type ActivityLog } from '@/types/log';
import axiosInstance from './axios';

export const fetchLogs = async (
	filters: LogFilterValues
): Promise<ActivityLog[]> => {
	try {
		let url = `/log?`;
		if (filters.search) url += `search=${filters.search}&`;
		if (filters.page) url += `page=${filters.page}&`;
		if (filters.pageSize) url += `pageSize=${filters.pageSize}&`;
		if (filters.resource && filters.resource !== RESOURCE_TYPES.ALL)
			url += `resource=${filters.resource}&`;

		const { data } = await axiosInstance.get(url);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch logs', error);
		throw error;
	}
};
