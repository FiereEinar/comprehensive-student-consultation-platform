import type { UserFilterValues } from '@/stores/user-filter';
import axiosInstance from './axios';
import type { User } from '@/types/user';

export const fetchUsers = async (
	filters: Partial<UserFilterValues>
): Promise<User[]> => {
	try {
		let url = `/user?`;
		if (filters.search) url += `search=${filters.search}&`;
		if (filters.page) url += `page=${filters.page}&`;
		if (filters.pageSize) url += `pageSize=${filters.pageSize}&`;
		if (filters.role) url += `role=${filters.role}&`;

		const { data } = await axiosInstance.get(url);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch users', error);
		throw error;
	}
};
