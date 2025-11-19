import type { UserTypes } from '@/types/user';
import { create } from 'zustand';

export interface UserFilterValues {
	page: number;
	pageSize: number;
	search: string;
	role: UserTypes | null;
	// order: 'asc' | 'desc'
}

export interface UserFilterState extends UserFilterValues {
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	setSearch: (search: string) => void;
	setRole: (role: UserTypes) => void;
	// setOrder: (order: 'asc' | 'desc') => void
	getFilters: () => UserFilterValues;
}

export const useUserFilterStore = create<UserFilterState>((set, get) => ({
	page: 1,
	setPage: (page) => set({ page }),

	pageSize: 10,
	setPageSize: (pageSize) => set({ pageSize }),

	search: '',
	setSearch: (search) => set({ search, page: 1 }),

	role: null,
	setRole: (role) => set({ role }),
	// setOrder: (order) => set({ order }),

	getFilters: () => ({
		page: get().page,
		pageSize: get().pageSize,
		search: get().search,
		role: get().role,
		// order: get().order,
	}),
}));
