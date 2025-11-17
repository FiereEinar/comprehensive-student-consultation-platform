import type { ConsultationStatus } from '@/types/consultation';
import { create } from 'zustand';

interface ConsultationFilterState {
	status: ConsultationStatus[];
	setStatus: (status: ConsultationStatus[]) => void;

	limit: number;
	setLimit: (limit: number) => void;

	search: string;
	setSearch: (search: string) => void;

	page: number;
	setPage: (page: number) => void;

	pageSize: number;
	setPageSize: (pageSize: number) => void;

	getFilters: () => {
		status: ConsultationStatus[];
		limit: number;
		search: string;
		page: number;
		pageSize: number;
	};
}

export const useConsultationStateStore = create<ConsultationFilterState>(
	(set, get) => ({
		status: [],
		setStatus: (status) => set({ status }),

		limit: 10,
		setLimit: (limit) => set({ limit }),

		search: '',
		setSearch: (search) => set({ search, page: 1 }),

		page: 1,
		setPage: (page) => set({ page }),

		pageSize: 10,
		setPageSize: (pageSize) => set({ pageSize }),

		getFilters: () => ({
			status: get().status,
			limit: get().limit,
			search: get().search,
			page: get().page,
			pageSize: get().pageSize,
		}),
	})
);
