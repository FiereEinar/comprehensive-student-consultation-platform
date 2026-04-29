import axiosInstance from './axios';
import type { Subject } from '../types/subject';

export const fetchSubjects = async (params?: { schoolYear?: string; semester?: number; instructor?: string }) => {
	const { data } = await axiosInstance.get('/subject', { params });
	return data as Subject[];
};

export const createSubject = async (payload: Partial<Subject>) => {
	const { data } = await axiosInstance.post('/subject', payload);
	return data;
};

export const updateSubject = async (id: string, payload: Partial<Subject>) => {
	const { data } = await axiosInstance.patch(`/subject/${id}`, payload);
	return data;
};

export const deleteSubject = async (id: string) => {
	const { data } = await axiosInstance.delete(`/subject/${id}`);
	return data;
};
