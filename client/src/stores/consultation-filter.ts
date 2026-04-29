import type { ConsultationStatus } from '@/types/consultation';
import { create } from 'zustand';

export interface ConsultationFilterValues {
	status: ConsultationStatus[];
	search: string;
	page: number;
	pageSize: number;
	order: 'asc' | 'desc';
	userID: string;
	schoolYear?: string;
	semester?: string;
	instructorFilter?: string;
}

export interface ConsultationFilterState extends ConsultationFilterValues {
	setStatus: (status: ConsultationStatus[]) => void;
	setSearch: (search: string) => void;
	setPage: (page: number) => void;
	setPageSize: (pageSize: number) => void;
	setOrder: (order: 'asc' | 'desc') => void;
	setUserID: (userID: string) => void;
	setSchoolYear: (schoolYear: string) => void;
	setSemester: (semester: string) => void;
	setInstructorFilter: (instructorFilter: string) => void;
	resetFilters: () => void;
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

		schoolYear: '',
		setSchoolYear: (schoolYear) => set({ schoolYear, page: 1 }),

		semester: '',
		setSemester: (semester) => set({ semester, page: 1 }),

		instructorFilter: '',
		setInstructorFilter: (instructorFilter) => set({ instructorFilter, page: 1 }),

		resetFilters: () =>
			set({
				status: [],
				search: '',
				page: 1,
				schoolYear: '',
				semester: '',
				instructorFilter: '',
			}),

		getFilters: (): ConsultationFilterValues => {
			const values: ConsultationFilterValues = {
				status: get().status,
				search: get().search,
				page: get().page,
				pageSize: get().pageSize,
				order: get().order,
				userID: get().userID,
			};
			if (get().schoolYear) values.schoolYear = get().schoolYear;
			if (get().semester) values.semester = get().semester;
			if (get().instructorFilter) values.instructorFilter = get().instructorFilter;
			return values;
		},
	})
);
