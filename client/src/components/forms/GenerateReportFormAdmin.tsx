import { useState } from 'react';
import { fetchInstructors } from '@/api/instructor';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { QUERY_KEYS } from '@/constants';
import { useQuery } from '@tanstack/react-query';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { FieldLabel, FieldError } from '../ui/field';
import * as z from 'zod';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { generateReportSignature } from '@/utils/ReportSignature';

import type { ConsultationRow } from '@/components/reports/ConsultationReportView';
import { generateConsultationPdf } from '@/utils/GenerateConsultationPdf';

// ===== VALIDATION SCHEMA =====
const generateReportSchema = z.object({
	instructor: z.string().min(1, 'Instructor is required'),
	semester: z.enum(['1st', '2nd']),
	schoolYearStart: z.preprocess(
		(val) => (val ? parseInt(String(val)) : undefined),
		z.number().int().min(2000).max(2100)
	),
	schoolYearEnd: z.preprocess(
		(val) => (val ? parseInt(String(val)) : undefined),
		z.number().int().min(2000).max(2100)
	),
});

export type GenerateReportFormValues = z.infer<typeof generateReportSchema>;

// ===== REPORT DATA TYPE =====
type ReportData = {
	instructorName: string;
	periodLabel: string;
	semesterLabel: string;
	consultations: ConsultationRow[];
	acceptedConsultations: ConsultationRow[];
	pendingConsultations: ConsultationRow[];
	declinedConsultations: ConsultationRow[];
	completedConsultations: ConsultationRow[];
	totalAccepted: number;
	totalPending: number;
	totalDeclined: number;
	totalCompleted: number;
	totalFinished: number;
	reportSignature: string;
};

// Match your DB statuses: "accepted" and "pending"
const SPLIT_STATUS = {
	accepted: ['accepted'],
	pending: ['pending'],
	declined: ['declined'],
	completed: ['completed'],
};

// ===== MAIN COMPONENT (DEFAULT EXPORT) =====
export default function GenerateReportFormAdmin() {
	const { control, handleSubmit, watch } = useForm<GenerateReportFormValues>({
		resolver: zodResolver(generateReportSchema as any),
		defaultValues: {
			instructor: '',
			semester: '1st',
			schoolYearStart: new Date().getFullYear(),
			schoolYearEnd: new Date().getFullYear() + 1,
		},
	});

	const schoolYearStart = watch('schoolYearStart') as number;
	const schoolYearEnd = watch('schoolYearEnd') as number;
	const semester = watch('semester') as '1st' | '2nd';

	const [_reportData, setReportData] = useState<ReportData | null>(null);

	const { data: instructors } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTORS],
		queryFn: fetchInstructors,
	});

	const getSemesterDateRange = (
		startYear: number,
		endYear: number,
		sem: '1st' | '2nd'
	): string => {
		if (sem === '1st') {
			return `August–December ${startYear}`;
		}
		return `January–May ${endYear}`;
	};

	const semesterDateRange = getSemesterDateRange(
		schoolYearStart,
		schoolYearEnd,
		semester
	);

	const onSubmit = async (formData: GenerateReportFormValues) => {
		try {
			const { instructor, semester, schoolYearStart, schoolYearEnd } = formData;

			// This is the old date range label (still used in Summary)
			const periodLabel =
				semester === '1st'
					? `August–December ${schoolYearStart}`
					: `January–May ${schoolYearEnd}`;

			// This is the semester label that will appear in the header
			const semesterLabel = semester === '1st' ? '1st' : '2nd';

			const range =
				semester === '1st'
					? {
							start: `${schoolYearStart}-08-01T00:00:00.000Z`,
							end: `${schoolYearStart}-12-31T23:59:59.999Z`,
					  }
					: {
							start: `${schoolYearEnd}-01-01T00:00:00.000Z`,
							end: `${schoolYearEnd}-05-31T23:59:59.999Z`,
					  };

			const params = {
				instructorId: instructor,
				startDate: range.start,
				endDate: range.end,
			};

			const res = await axiosInstance.get('/consultation/report', {
				params,
			});
			const responseBody = res.data;

			const raw: any[] = Array.isArray(responseBody)
				? responseBody
				: Array.isArray(responseBody?.data)
				? responseBody.data
				: Array.isArray((responseBody as any).consultations)
				? (responseBody as any).consultations
				: [];

			const allConsultations: ConsultationRow[] = raw.map((c: any) => ({
				_id: c._id?.$oid ?? c._id ?? '',
				title: c.title ?? '',
				purpose: c.purpose ?? '',
				subjectCode: c.subjectCode ?? '',
				sectonCode: c.sectonCode ?? '',
				status: c.status ?? '',
				scheduledAt: c.scheduledAt
					? new Date(c.scheduledAt).toLocaleString()
					: '',
			}));

			const acceptedConsultations = allConsultations.filter((c) =>
				SPLIT_STATUS.accepted.includes(String(c.status))
			);
			const pendingConsultations = allConsultations.filter((c) =>
				SPLIT_STATUS.pending.includes(String(c.status))
			);
			const declinedConsultations = allConsultations.filter((c) =>
				SPLIT_STATUS.declined.includes(String(c.status))
			);
			const completedConsultations = allConsultations.filter((c) =>
				SPLIT_STATUS.completed.includes(String(c.status))
			);

			const totalAccepted = acceptedConsultations.length;
			const totalPending = pendingConsultations.length;
			const totalDeclined = declinedConsultations.length;
			const totalCompleted = completedConsultations.length;
			const totalFinished = totalAccepted + totalCompleted;

			const instructorRes = await axiosInstance.get(`/user/${instructor}`);
			const instructorName: string =
				instructorRes.data?.data?.name ??
				instructorRes.data?.name ??
				'Unknown Instructor';

			const reportSignature = generateReportSignature();

			const newReportData: ReportData = {
				instructorName,
				periodLabel,
				semesterLabel,
				consultations: allConsultations,
				acceptedConsultations,
				pendingConsultations,
				declinedConsultations,
				completedConsultations,
				totalAccepted,
				totalPending,
				totalDeclined,
				totalCompleted,
				totalFinished,
				reportSignature,
			};

			setReportData(newReportData);

			generateConsultationPdf({
				instructorName,
				periodLabel,
				semesterLabel,
				buckets: {
					accepted: acceptedConsultations,
					pending: pendingConsultations,
					declined: declinedConsultations,
					completed: completedConsultations,
				},
				reportSignature,
			});

			toast.success('Report generated and downloading...');
		} catch (error: any) {
			console.error('Failed to generate report', error);
			toast.error(error.response?.data?.message ?? 'Failed to generate report');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='default' className='cursor-pointer'>
					Generate Report
				</Button>
			</DialogTrigger>

			<DialogContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Generate Instructor Report</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
					{/* INSTRUCTOR SELECT */}
					<Controller
						name='instructor'
						control={control}
						render={({ field, fieldState }) => (
							<div>
								<FieldLabel htmlFor='instructor'>Instructor Name</FieldLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger
										id='instructor'
										className='w-full'
										data-invalid={fieldState.invalid}
									>
										<SelectValue placeholder='Select Instructor' />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectLabel>Instructors</SelectLabel>
											{instructors?.map((instr) => (
												<SelectItem key={instr._id} value={instr._id}>
													{instr.name}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>

					{/* SEMESTER SELECT */}
					<Controller
						name='semester'
						control={control}
						render={({ field, fieldState }) => (
							<div>
								<FieldLabel htmlFor='semester'>Semester</FieldLabel>
								<Select onValueChange={field.onChange} value={field.value}>
									<SelectTrigger
										id='semester'
										className='w-full'
										data-invalid={fieldState.invalid}
									>
										<SelectValue placeholder='Select Semester' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='1st'>1st Semester</SelectItem>
										<SelectItem value='2nd'>2nd Semester</SelectItem>
									</SelectContent>
								</Select>
								{fieldState.error && <FieldError errors={[fieldState.error]} />}
							</div>
						)}
					/>

					{/* SCHOOL YEAR INPUTS */}
					<div>
						<FieldLabel htmlFor='schoolYearStart'>School Year</FieldLabel>
						<div className='flex gap-2'>
							<Controller
								name='schoolYearStart'
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id='schoolYearStart'
										name='schoolYearStart'
										type='number'
										placeholder='2022'
										className='flex-1'
										min={2000}
										max={2100}
									/>
								)}
							/>
							<span className='flex items-center px-2 text-muted-foreground'>
								-
							</span>
							<Controller
								name='schoolYearEnd'
								control={control}
								render={({ field }) => (
									<Input
										{...field}
										id='schoolYearEnd'
										name='schoolYearEnd'
										type='number'
										placeholder='2023'
										className='flex-1'
										min={2000}
										max={2100}
									/>
								)}
							/>
						</div>
					</div>

					{/* SEMESTER PERIOD DISPLAY */}
					<div className='p-3 bg-muted/50 rounded-md text-sm text-muted-foreground'>
						Period: {semesterDateRange}
					</div>

					<Button type='submit' className='w-full'>
						Generate Report
					</Button>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant='outline' className='w-full'>
							Cancel
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
