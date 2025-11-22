import { RESOURCE_TYPES, type LOG_RESOURCES } from '@/types/log';
import { create } from 'zustand';

export interface LogFilterValues {
	resource: LOG_RESOURCES;
	search: string;
	page: number;
	pageSize: number;
}

export interface LogFilterState extends LogFilterValues {
	setResource: (resource: LOG_RESOURCES) => void;
	setSearch: (search: string) => void;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	getFilters: () => LogFilterValues;
}

export const useLogFilterStore = create<LogFilterState>((set, get) => ({
	resource: RESOURCE_TYPES.ALL,
	search: '',
	page: 1,
	pageSize: 10,
	setResource: (resource: LOG_RESOURCES) => set({ resource }),
	setSearch: (search) => set({ search }),
	setPage: (page) => set({ page }),
	setPageSize: (pageSize) => set({ pageSize }),
	getFilters: () => ({
		resource: get().resource,
		search: get().search,
		page: get().page,
		pageSize: get().pageSize,
	}),
}));
