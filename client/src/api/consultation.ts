import type { Consultation, ConsultationStatus } from '@/types/consultation';
import axiosInstance from './axios';

/**
 * query: status = 'pending' | 'accepted' | 'declined' | 'completed'
 * limit: number
 */
export const fetchUserConsultations = async (
	userID: string,
	query?: ConsultationStatus,
	limit?: number
): Promise<Consultation[]> => {
	try {
		const { data } = await axiosInstance.get(
			`/user/${userID}/consultation?status=${query}&limit=${limit}`
		);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch consultations', error);
		throw error;
	}
};
