import type { ConsultationStatus } from '@/types/consultation';
import { create } from 'zustand';

export interface ConsultationFilterValues {
	status: ConsultationStatus[];
	search: string;
	page: number;
	pageSize: number;
	order: 'asc' | 'desc';
	userID: string;
}

export interface ConsultationFilterState extends ConsultationFilterValues {
	setStatus: (status: ConsultationStatus[]) => void;
	setSearch: (search: string) => void;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	setOrder: (order: 'asc' | 'desc') => void;
	setUserID: (userID: string) => void;
	getFilters: () => ConsultationFilterValues;
}

export const useConsultationStateStore = create<ConsultationFilterState>(
	(set, get) => ({
		status: [],
		setStatus: (status) => set({ status }),

		search: '',
		setSearch: (search) => set({ search, page: 1 }),

		page: 1,
		setPage: (page) => set({ page }),

		pageSize: 10,
		setPageSize: (pageSize) => set({ pageSize }),

		order: 'desc',
		setOrder: (order) => set({ order }),

		userID: '',
		setUserID: (userID) => set({ userID }),

		getFilters: (): ConsultationFilterValues => ({
			status: get().status,
			search: get().search,
			page: get().page,
			pageSize: get().pageSize,
			order: get().order,
			userID: get().userID,
		}),
	})
);
