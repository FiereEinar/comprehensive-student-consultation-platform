import type { Invitation, User } from '@/types/user';
import axiosInstance from './axios';

export type AvailabilityType = {
	_id: string;
	day: string;
	startTime: string;
	endTime: string;
	slots: string;
	user: string;
};

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
): Promise<AvailabilityType[]> => {
	const res = await axiosInstance.get(`/availability?userID=${instructorID}`);
	// If your API may return InstructorAvailability shaped objects, fix here:
	return (res.data?.data || []).map((a: any) => ({
		_id: a._id,
		day: a.day,
		startTime: a.startTime,
		endTime: a.endTime,
		slots: String(a.slots), // ensure string
		user: a.user,
	}));
};

export const fetchInvitations = async (): Promise<Invitation[]> => {
	try {
		const { data } = await axiosInstance.get(`/auth/invite`);

		return data.data;
	} catch (error: any) {
		console.error('Failed to fetch invitations', error);
		throw error;
	}
};
