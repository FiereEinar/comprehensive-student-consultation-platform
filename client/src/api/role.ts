import axiosInstance from './axios';

export interface Role {
	_id: string;
	name: string;
	description?: string;
	permissions?: string[];
	createdAt: string;
	updatedAt: string;
}

export const fetchRoles = async (params?: {
	page?: number;
	pageSize?: number;
	search?: string;
}): Promise<Role[]> => {
	const response = await axiosInstance.get('/role', { params });
	return response.data.data;
};

export const createRole = async (data: {
	name: string;
	description?: string;
	// permissionIds: string[];
}): Promise<Role> => {
	const response = await axiosInstance.post('/role', data);
	return response.data.data;
};

export const updateRole = async (
	roleId: string,
	data: {
		name?: string;
		description?: string;
		permissions?: string[];
	}
): Promise<Role> => {
	const response = await axiosInstance.patch(`/role/${roleId}`, data);
	return response.data.data;
};

export const deleteRole = async (roleId: string): Promise<void> => {
	await axiosInstance.delete(`/role/${roleId}`);
};
