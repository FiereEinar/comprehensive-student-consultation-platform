import { useEffect, useState } from 'react';
import Header from '@/components/ui/header';
import {
	PieChart,
	Pie,
	Tooltip,
	Legend,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Cell,
} from 'recharts';
import GenerateReportFormAdmin from '@/components/forms/GenerateReportFormAdmin';
import axiosInstance from '@/api/axios';

const PIE_COLORS = [
	'#0088FE',
	'#00C49F',
	'#FFBB28',
	'#FF8042',
	'#AF19FF',
	'#FF6565',
	'#845EC2',
];
const BAR_COLORS = [
	'#00C49F',
	'#FF8042',
	'#FFBB28',
	'#0088FE',
	'#845EC2',
	'#FFC6FF',
	'#B2F7EF',
];

interface UserLike {
	_id: string;
	name?: string;
	email?: string;
	[key: string]: any;
}
interface Consultation {
	_id: string;
	createdAt: { $date: string };
	description: string;
	instructor: string | UserLike;
	scheduledAt: { $date: string };
	status: string;
	student: string | UserLike;
	title: string;
	updatedAt: { $date: string };
}

type MaybeString = string | undefined | null;
function getConsultationDate(c: Consultation): Date | null {
	let raw: MaybeString = undefined;
	if (c?.scheduledAt && typeof c.scheduledAt === 'object') {
		raw =
			(c.scheduledAt as any).$date ?? (c.scheduledAt as any).date ?? undefined;
	} else if (typeof c?.scheduledAt === 'string') {
		raw = c.scheduledAt;
	}
	raw = raw ?? (c as any).date ?? (c as any).createdAt?.$date ?? undefined;
	if (typeof raw !== 'string' || !raw) return null;
	const d = new Date(raw);
	if (!d || isNaN(d.getTime())) return null;
	return d;
}

function getLastNConsecutiveMonthsData(
	n: number,
	monthData: Array<{ name: string; value: number }>
) {
	const now = new Date();
	const months = [];
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const label = d.toLocaleString('default', {
			month: 'short',
			year: 'numeric',
		});
		const found = monthData.find((m) => m.name === label);
		months.push({
			name: label,
			value: found ? found.value : 0,
		});
	}
	return months;
}

export default function AdminReportsPage() {
	const [consultations, setConsultations] = useState<Consultation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchConsultations() {
			setLoading(true);
			setError(null);
			try {
				const { data } = await axiosInstance.get('/consultation?fetchAll=true');
				let cons: any = data;
				if (Array.isArray(cons)) {
					setConsultations(cons);
				} else if (cons?.data && Array.isArray(cons.data)) {
					setConsultations(cons.data);
				} else if (cons?.consultations && Array.isArray(cons.consultations)) {
					setConsultations(cons.consultations);
				} else {
					setConsultations([]);
					setError(
						'No consultation data found in API response. API shape: ' +
							JSON.stringify(cons)
					);
				}
			} catch (e: any) {
				setError('Error loading consultations: ' + (e.message || String(e)));
				setConsultations([]);
			}
			setLoading(false);
		}
		fetchConsultations();
		// logPageView();
	}, []);

	if (loading) return <div>Loading consultations...</div>;
	if (error)
		return <div style={{ color: 'red', fontWeight: 700 }}>{error}</div>;

	// PieChart: Status breakdown & percentages
	const statusCounts: Record<string, number> = {};
	consultations.forEach((c) => {
		if (!c?.status) return;
		statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
	});
	const statusData = Object.entries(statusCounts).map(([name, value]) => ({
		name,
		value,
	}));
	const totalConsultations = statusData.reduce(
		(acc, cur) => acc + cur.value,
		0
	);
	const statusPercents = statusData.map((d) => ({
		...d,
		percent: totalConsultations
			? Math.round((d.value / totalConsultations) * 100)
			: 0,
	}));

	// BarChart: Instructor breakdown, top 3 only
	const instructorCounts: Record<string, number> = {};
	consultations.forEach((c) => {
		let name =
			typeof c?.instructor === 'object' && c.instructor?.name
				? c.instructor.name
				: typeof c?.instructor === 'string'
				? c.instructor
				: 'Unknown';
		instructorCounts[name] = (instructorCounts[name] || 0) + 1;
	});
	const instructorData = Object.entries(instructorCounts).map(
		([name, value]) => ({ name, value })
	);
	const top3Instructors = [...instructorData]
		.sort((a, b) => b.value - a.value)
		.slice(0, 3);

	// Month Cards Section
	const monthCounts: Record<string, number> = {};
	let minYear = Infinity,
		minMonth = 12,
		maxYear = -Infinity,
		maxMonth = 1;
	consultations.forEach((c) => {
		const date = getConsultationDate(c);
		if (!date) return;
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		minYear = Math.min(minYear, year);
		minMonth = minYear === year ? Math.min(minMonth, month) : minMonth;
		maxYear = Math.max(maxYear, year);
		maxMonth = maxYear === year ? Math.max(maxMonth, month) : maxMonth;
		const key = `${year}-${month}`;
		monthCounts[key] = (monthCounts[key] || 0) + 1;
	});
	// build full monthData (for continuity)
	const monthData: Array<{ name: string; value: number }> = [];
	if (minYear !== Infinity && maxYear !== -Infinity) {
		let y = minYear,
			m = minMonth;
		while (y < maxYear || (y === maxYear && m <= maxMonth)) {
			const key = `${y}-${m}`;
			const date = new Date(y, m - 1, 1);
			const label = date.toLocaleString('default', {
				month: 'short',
				year: 'numeric',
			});
			monthData.push({
				name: label,
				value: monthCounts[key] || 0,
			});
			m++;
			if (m > 12) {
				m = 1;
				y++;
			}
		}
	}
	// 6 most recent months, split into 2 rows of 3
	const latestSixCards = getLastNConsecutiveMonthsData(6, monthData);
	const rows = [latestSixCards.slice(0, 3), latestSixCards.slice(3, 6)];

	// Extra stats, non-repeating
	const studentSet = new Set(
		consultations
			.map((c) =>
				typeof c.student === 'object' && c.student?.email
					? c.student.email
					: typeof c.student === 'string'
					? c.student
					: null
			)
			.filter(Boolean)
	);
	const instructorSet = new Set(instructorData.map((d) => d.name));
	const avgPerInstructor = instructorData.length
		? Math.round(totalConsultations / instructorData.length)
		: 0;

	const chartHeight = 370;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				gap: '2rem',
				padding: '2rem',
				minHeight: '195vh',
				background: '#faf2f7',
			}}
		>
			{/* Left Column */}
			<div
				style={{
					flex: '2 1 0%',
					display: 'flex',
					flexDirection: 'column',
					gap: '1.5rem',
					minWidth: 0,
					paddingBottom: '20rem',
					marginBottom: '100px',
					position: 'relative',
				}}
			>
				<Header size='md'>Admin Consultations Dashboard</Header>

				{/* --- Consultations by Month Section --- */}
				<div
					style={{
						fontSize: '18px',
						color: '#000000ff',
						fontWeight: 500,
						marginBottom: '-.2rem',
					}}
				>
					Consultations by Month
				</div>
				<section
					style={{
						borderRadius: '14px',
						minHeight: '310px',
						marginBottom: '0.7rem',
						display: 'flex',
						flexDirection: 'column',
						padding: '1rem',
						background: 'white',
						alignContent: 'center',
						justifyContent: 'center',
					}}
				>
					{rows.map((row, idx) => (
						<div
							key={idx}
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: '5px',
								width: '100%',
								justifyContent: 'space-between',
								marginBottom: idx === 0 ? '1rem' : '0',
							}}
						>
							{row.map(({ name, value }, i) => (
								<div
									key={name + i}
									style={{
										flex: 1,
										background: '#fff',
										borderRadius: '8px',
										boxShadow: '2px 2px 3px #968f8fff',
										minWidth: '32%',
										maxWidth: 210,
										margin: 0,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '1.6rem 0.5rem',
										border: '2px solid #eee',
									}}
								>
									<div
										style={{
											fontSize: '1.15rem',
											color: '#87858aff',
											fontWeight: 500,
											marginBottom: 6,
											letterSpacing: '0.5px',
										}}
									>
										{name}
									</div>
									<div
										style={{
											fontSize: '2.15rem',
											fontWeight: 700,
											color: 'black',
											lineHeight: 1.18,
										}}
									>
										{value}
									</div>
								</div>
							))}
						</div>
					))}
				</section>

				{/* Rest of your dashboard untouched... */}
				{/* Consultations by Status */}
				<div
					style={{
						fontSize: '18px',
						color: '#000000ff',
						fontWeight: 500,
						marginBottom: '-.5rem',
					}}
				>
					Consultations by Status
				</div>
				<section
					style={{
						padding: '1rem',
						borderRadius: '14px',
						background: '#fff',
						boxShadow: '0 2px 8px #eee',
						minHeight: 450,
						border: '2px solid #eee',
						marginBottom: '0.7rem',
					}}
				>
					{statusPercents.length ? (
						<ResponsiveContainer width='100%' height={chartHeight}>
							<PieChart>
								<Pie
									data={statusPercents}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={100}
									label={({ name, percent }) => `${name}: ${percent}%`}
								>
									{statusPercents.map((_, idx) => (
										<Cell
											key={`cell-status-${idx}`}
											fill={PIE_COLORS[idx % PIE_COLORS.length]}
										/>
									))}
								</Pie>
								<Legend />
								<Tooltip
									formatter={(v, name, props) => [
										`${props.payload.percent}% (${v})`,
										name,
									]}
								/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<div
							style={{
								color: '#444',
								padding: '1rem',
								textAlign: 'center',
								fontStyle: 'italic',
							}}
						>
							No status data to visualize.
						</div>
					)}
				</section>

				{/* Consultations by Instructor */}
				<div
					style={{
						fontSize: '18px',
						color: '#000000ff',
						fontWeight: 500,
						marginBottom: '-.5rem',
					}}
				>
					Consultations by Instructor
				</div>
				<section
					style={{
						padding: '1rem',
						borderRadius: '14px',
						background: '#fff',
						boxShadow: '0 2px 8px #eee',
						minWidth: '200px',
						marginBottom: '2.5rem',
						border: '2px solid #eee',
					}}
				>
					{instructorData.length ? (
						<ResponsiveContainer width='100%' height={chartHeight}>
							<BarChart
								data={top3Instructors}
								margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
							>
								<CartesianGrid strokeDasharray='5 5' />
								<XAxis dataKey='name' tick={{ fontSize: 14, fill: 'black' }} />
								<YAxis />
								<Tooltip />
								<Legend wrapperStyle={{ color: 'black' }} iconType='line' />
								<Bar dataKey='value'>
									{instructorData.map((_, idx) => (
										<Cell
											key={`cell-bar-${idx}`}
											fill={BAR_COLORS[idx % BAR_COLORS.length]}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<div
							style={{
								color: '#444',
								padding: '1rem',
								textAlign: 'center',
								fontStyle: 'italic',
							}}
						>
							No instructor data to visualize.
						</div>
					)}
				</section>
			</div>

			{/* Right Column untouched... */}
			<div
				style={{
					flex: '1 1 0%',
					display: 'flex',
					flexDirection: 'column',
					gap: '2rem',
					alignItems: 'left',
					minWidth: 0,
					marginTop: '3rem',
					position: 'sticky',
					top: '2rem',
					height: 'fit-content',
				}}
			>
				{/* Other Consultation Stats */}
				<div
					style={{
						fontSize: '18px',
						color: '#000000ff',
						fontWeight: 500,
						marginBottom: '-.5rem',
					}}
				>
					General Reports
				</div>
				<section
					style={{
						width: '100%',
						padding: '1rem',
						borderRadius: '14px',
						background: '#fff',
						boxShadow: '0 2px 8px #eee',
						border: '2px solid #eee',
					}}
				>
					<div
						style={{
							background: '#fff',
							borderRadius: '12px',
							padding: '1.2rem',
							width: '100%',
						}}
					>
						<div
							style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
						>
							<div>
								Total Consultations: <strong>{totalConsultations}</strong>
							</div>
							<div>
								Total Instructors: <strong>{instructorSet.size}</strong>
							</div>
							<div>
								Total Students: <strong>{studentSet.size}</strong>
							</div>
							<div>
								Average Consultations: <strong>{avgPerInstructor}</strong>
							</div>
							<GenerateReportFormAdmin />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
