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
import { usePDF } from 'react-to-pdf';
import { generateReportSignature } from '@/utils/ReportSignature'; 
import { ConsultationReportView } from '../reports/ConsultationReportView';
import type { ConsultationRow } from '../reports/ConsultationReportView';




// ===== VALIDATION SCHEMA =====
const generateReportSchema = z.object({
    instructor: z.string().min(1, 'Instructor is required'),
    semester: z.enum(['1st', '2nd']),
    schoolYearStart: z.preprocess(
        (val) => (val ? parseInt(String(val)) : undefined),
        z.number().int().min(2000).max(2100),
    ),
    schoolYearEnd: z.preprocess(
        (val) => (val ? parseInt(String(val)) : undefined),
        z.number().int().min(2000).max(2100),
    ),
});

export type GenerateReportFormValues = z.infer<typeof generateReportSchema>;

// ===== MAIN COMPONENT =====
export default function GenerateReportFormAdmin() {
    // ===== FORM SETUP =====
    const { control, handleSubmit, watch } = useForm<GenerateReportFormValues>({
        resolver: zodResolver(generateReportSchema as any),
        defaultValues: {
            instructor: '',
            semester: '1st' as const,
            schoolYearStart: new Date().getFullYear(),
            schoolYearEnd: new Date().getFullYear() + 1,
        },
    });

    // ===== WATCH FORM VALUES =====
    const schoolYearStart = watch('schoolYearStart') as number;
    const schoolYearEnd = watch('schoolYearEnd') as number;
    const semester = watch('semester') as '1st' | '2nd';

    // ===== STATE FOR REPORT DATA =====
    const [reportData, setReportData] = useState<{
        instructorName: string;
        periodLabel: string;
        consultations: ConsultationRow[];
        reportSignature: string;
    } | null>(null);

    // ===== PDF GENERATION HOOK =====
    const { toPDF, targetRef } = usePDF({
        filename: `consultation-report-${new Date().getTime()}.pdf`,
    });

    // ===== FETCH INSTRUCTORS =====
    const { data: instructors } = useQuery({
        queryKey: [QUERY_KEYS.INSTRUCTORS],
        queryFn: fetchInstructors,
    });

    // ===== HELPER: GET SEMESTER DATE RANGE =====
    const getSemesterDateRange = (
        startYear: number,
        endYear: number,
        sem: '1st' | '2nd',
    ): string => {
        if (sem === '1st') {
            return `August–December ${startYear}`;
        }
        return `January–May ${endYear}`;
    };

    const semesterDateRange = getSemesterDateRange(
        schoolYearStart,
        schoolYearEnd,
        semester,
    );

    // ===== FORM SUBMIT HANDLER =====
    const onSubmit = async (formData: GenerateReportFormValues) => {
        try {
            const { instructor, semester, schoolYearStart, schoolYearEnd } =
                formData;

            // 1. Build period label
            const periodLabel =
                semester === '1st'
                    ? `August–December ${schoolYearStart}`
                    : `January–May ${schoolYearEnd}`;

            // 2. Build date range for API call
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

            // 3. Fetch finished consultations for this instructor + date range
			const consultationsRes = await axiosInstance.get(
			'/api/v1/consultation/report',
			{
				params: {
				instructorId: instructor,
				status: 'completed', // matches your DB status value
				startDate: range.start,
				endDate: range.end,
				},
			},
			);
            const rawConsultations: any[] = consultationsRes.data;

            // 4. Map API response to ConsultationRow type
            const consultations: ConsultationRow[] = rawConsultations.map(
                (c) => ({
                    _id: c._id?.$oid ?? c._id ?? '',
                    title: c.title ?? '',
                    purpose: c.purpose ?? '',
                    subjectCode: c.subjectCode ?? '',
                    sectonCode: c.sectonCode ?? '',
                    status: c.status ?? '',
                    scheduledAt: c.scheduledAt?.$date
                        ? new Date(c.scheduledAt.$date).toLocaleString()
                        : '',
                }),
            );

            // 5. Fetch instructor name
            const instructorRes = await axiosInstance.get(`/users/${instructor}`);
            const instructorName: string = instructorRes.data.name ?? 'Unknown Instructor';

            // 6. GENERATE UNIQUE SIGNATURE (most important part!)
            const reportSignature = generateReportSignature();
            // Example: "CSCP1128202580000"

            // 7. Save data to state
            setReportData({
                instructorName,
                periodLabel,
                consultations,
                reportSignature,
            });

            // 8. Wait for React to render the report, then generate PDF
            setTimeout(() => {
                toPDF();
            }, 300);

            toast.success('Report generated and downloading...');
        } catch (error: any) {
            console.error('Failed to generate report', error);
            toast.error(
                error.response?.data?.message ?? 'Failed to generate report',
            );
        }
    };

    return (
        <Dialog>
            {/* ===== TRIGGER BUTTON ===== */}
            <DialogTrigger asChild>
                <Button variant='default' className='cursor-pointer'>
                    Generate Report
                </Button>
            </DialogTrigger>

            {/* ===== DIALOG CONTENT ===== */}
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Generate Instructor Report</DialogTitle>
                </DialogHeader>

                {/* ===== FORM ===== */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='grid gap-4'
                >
                    {/* INSTRUCTOR SELECT */}
                    <Controller
                        name='instructor'
                        control={control}
                        render={({ field, fieldState }) => (
                            <div>
                                <FieldLabel htmlFor={field.name}>
                                    Instructor Name
                                </FieldLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        className='w-full'
                                        data-invalid={fieldState.invalid}
                                    >
                                        <SelectValue placeholder='Select Instructor' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Instructors</SelectLabel>
                                            {instructors?.map((instr) => (
                                                <SelectItem
                                                    key={instr._id}
                                                    value={instr._id}
                                                >
                                                    {instr.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
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
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectTrigger
                                        className='w-full'
                                        data-invalid={fieldState.invalid}
                                    >
                                        <SelectValue placeholder='Select Semester' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='1st'>
                                            1st Semester
                                        </SelectItem>
                                        <SelectItem value='2nd'>
                                            2nd Semester
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </div>
                        )}
                    />

                    {/* SCHOOL YEAR INPUTS */}
                    <div>
                        <FieldLabel>School Year</FieldLabel>
                        <div className='flex gap-2'>
                            <Controller
                                name='schoolYearStart'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
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
                        📅 Period: {semesterDateRange}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <Button type='submit' className='w-full'>
                        Generate Report
                    </Button>
                </form>

                {/* ===== DIALOG FOOTER ===== */}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant='outline' className='w-full'>
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>

            {/* ===== HIDDEN REPORT CONTAINER ===== */}
            {/* This div is hidden off-screen but still in DOM */}
            {/* react-to-pdf will capture this div and convert it to PDF */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                {reportData && (
                    <ConsultationReportView
                        ref={targetRef}
                        instructorName={reportData.instructorName}
                        periodLabel={reportData.periodLabel}
                        consultations={reportData.consultations}
                        totalFinished={reportData.consultations.length}
                        reportSignature={reportData.reportSignature}
                    />
                )}
            </div>
        </Dialog>
    );
}
