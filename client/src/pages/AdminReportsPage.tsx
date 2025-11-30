// File: src/pages/AdminReportsPage.tsx

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
import { Card, CardContent } from '@/components/ui/card';

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

type ObjectIdShape = { $oid: string };
type DateShape = { $date: string };

interface UserRaw {
	_id: ObjectIdShape;
	name: string;
	email: string;
	role: string;
	createdAt: DateShape;
	updatedAt: DateShape;
	[key: string]: any;
}

interface UserLike {
	_id: string;
	name: string;
	email?: string;
}

interface ConsultationRaw {
	_id: ObjectIdShape;
	createdAt: DateShape;
	description: string;
	googleCalendarEventId: string | null;
	instructor: ObjectIdShape;
	lock: { lockedAt: null; lockedBy: null };
	meetLink: null;
	purpose: string;
	scheduledAt: DateShape;
	sectonCode: string;
	status: string;
	student: ObjectIdShape;
	subjectCode: string;
	title: string;
	updatedAt: DateShape;
	[key: string]: any;
}

interface Consultation {
	_id: string;
	createdAt: DateShape;
	description: string;
	instructorId: string;
	scheduledAt: DateShape;
	status: string;
	studentId: string;
	title: string;
	updatedAt: DateShape;
	purpose: string;
	subjectCode: string;
	sectonCode: string;
	googleCalendarEventId: string | null;
	meetLink: null;
}

type MaybeString = string | undefined | null;

function normalizeId(id: ObjectIdShape | string): string {
	if (typeof id === 'string') return id;
	return id?.$oid ?? '';
}

function getDateFromShape(d: DateShape | string | undefined): Date | null {
	let raw: MaybeString;
	if (!d) return null;
	if (typeof d === 'string') raw = d;
	else raw = d.$date;
	if (!raw) return null;
	const dt = new Date(raw);
	if (isNaN(dt.getTime())) return null;
	return dt;
}

// Map raw status strings to pretty labels, but DO NOT drop unknown ones
function mapStatusLabel(raw: string): string {
	const s = raw.trim().toLowerCase();
	if (s.includes('accept')) return 'Accepted';
	if (s.includes('pend')) return 'Pending';
	if (s.includes('declin') || s.includes('reject')) return 'Declined';
	if (s.includes('complet') || s === 'done' || s.includes('finish'))
		return 'Completed';
	// fall back to the original status text so it still shows in the chart
	return raw || 'Unknown';
}

export default function AdminReportsPage() {
	const [consultations, setConsultations] = useState<Consultation[]>([]);
	const [users, setUsers] = useState<UserLike[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadAll() {
			setLoading(true);
			setError(null);
			try {
				const { data } = await axiosInstance.get('/consultation?fetchAll=true');
				const consRaw = data.data;

				const consList: ConsultationRaw[] = Array.isArray(consRaw)
					? consRaw
					: Array.isArray(consRaw.data)
					? consRaw.data
					: Array.isArray(consRaw.consultations)
					? consRaw.consultations
					: [];

				const cons: Consultation[] = consList.map((c) => ({
					_id: normalizeId(c._id),
					createdAt: c.createdAt,
					description: c.description,
					instructorId: normalizeId(c.instructor),
					scheduledAt: c.scheduledAt,
					status: c.status, // keep raw
					studentId: normalizeId(c.student),
					title: c.title,
					updatedAt: c.updatedAt,
					purpose: c.purpose,
					subjectCode: c.subjectCode,
					sectonCode: c.sectonCode,
					googleCalendarEventId: c.googleCalendarEventId,
					meetLink: c.meetLink,
				}));

				const { data: userRes } = await axiosInstance.get(
					'/user?fetchAll=true'
				);
				const userRaw = userRes.data;
				const userList: UserRaw[] = Array.isArray(userRaw)
					? userRaw
					: Array.isArray(userRaw.data)
					? userRaw.data
					: Array.isArray(userRaw.users)
					? userRaw.users
					: [];

				const mappedUsers: UserLike[] = userList.map((u) => ({
					_id: normalizeId(u._id),
					name: u.name,
					email: u.email,
				}));

				setConsultations(cons);
				setUsers(mappedUsers);
			} catch (e: any) {
				setError('Error loading reports: ' + (e.message || String(e)));
				setConsultations([]);
				setUsers([]);
			}
			setLoading(false);
		}

		loadAll();
		// logPageView();
	}, []);

	if (loading) return <div>Loading consultations...</div>;
	if (error)
		return <div style={{ color: 'red', fontWeight: 700 }}>{error}</div>;

	// ---------------------------------------------------------------------------
	// STATUS PIE – group by mapped label, never drop a status
	// ---------------------------------------------------------------------------

	const statusCounts: Record<string, number> = {};
	consultations.forEach((c) => {
		const label = mapStatusLabel(c.status);
		statusCounts[label] = (statusCounts[label] || 0) + 1;
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

	// ---------------------------------------------------------------------------
	// INSTRUCTOR BAR – all instructors with names from /user
	// ---------------------------------------------------------------------------

	const userById = new Map<string, UserLike>();
	users.forEach((u) => userById.set(u._id, u));

	const instructorCounts: Record<string, number> = {};
	consultations.forEach((c) => {
		const id = c.instructorId;
		const instructorUser = id ? userById.get(id) : undefined;
		const name = instructorUser?.name || `Instructor ${id.slice(0, 6)}`;
		instructorCounts[name] = (instructorCounts[name] || 0) + 1;
	});

	const instructorData = Object.entries(instructorCounts)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value); // highest first

	// ---------------------------------------------------------------------------
	// MONTH CARDS (same as before)
	// ---------------------------------------------------------------------------

	const monthCounts: Record<string, number> = {};
	let minYear = Infinity,
		minMonth = 12,
		maxYear = -Infinity,
		maxMonth = 1;

	consultations.forEach((c) => {
		const date =
			getDateFromShape(c.scheduledAt) || getDateFromShape(c.createdAt);
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

	function getLastNConsecutiveMonthsData(
		n: number,
		data: Array<{ name: string; value: number }>
	) {
		const now = new Date();
		const months: Array<{ name: string; value: number }> = [];
		for (let i = n - 1; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const label = d.toLocaleString('default', {
				month: 'short',
				year: 'numeric',
			});
			const found = data.find((m) => m.name === label);
			months.push({
				name: label,
				value: found ? found.value : 0,
			});
		}
		return months;
	}

	const latestSixCards = getLastNConsecutiveMonthsData(6, monthData);
	const rows = [latestSixCards.slice(0, 3), latestSixCards.slice(3, 6)];

	const studentSet = new Set(
		consultations.map((c) => c.studentId).filter(Boolean)
	);
	const instructorSet = new Set(Object.keys(instructorCounts));
	const avgPerInstructor = instructorData.length
		? Math.round(totalConsultations / instructorData.length)
		: 0;

	const chartHeight = 370;

	// ---------------------------------------------------------------------------
	// RENDER
	// ---------------------------------------------------------------------------

	return (
		<div className='space-y-5'>
			<Header size='md'>Admin Consultations Dashboard</Header>
			<div className='flex  gap-5 min-h-screen flex-wrap'>
				{/* Left Column */}
				<div
					className='w-[70%]'
					style={{
						flex: '2 1 300px',
						display: 'flex',
						flexDirection: 'column',
						gap: '1.5rem',
						minWidth: 0,
						paddingBottom: '20rem',
						marginBottom: '100px',
						position: 'relative',
					}}
				>
					<Card>
						<CardContent>
							{/* Consultations by Month */}
							<h2 className='font-medium mb-2'>Consultations by Month</h2>
							<section
								style={{
									borderRadius: '14px',
									minHeight: '310px',
									// marginBottom: '0.7rem',
									display: 'flex',
									flexDirection: 'column',
									minWidth: 0,
									// padding: '1rem',
									// background: 'white',
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
											minWidth: 0,
											width: '100%',
											justifyContent: 'space-between',
											marginBottom: idx === 0 ? '1rem' : '0',
											flexWrap: 'wrap',
										}}
									>
										{row.map(({ name, value }, i) => (
											<div
												key={name + i}
												style={{
													flex: '1 1 30%',
													background: '#fff',
													borderRadius: '8px',
													// boxShadow: '2px 2px 3px #968f8fff',
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
														minWidth: 0,
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
						</CardContent>
					</Card>

					{/* Consultations by Status */}

					<section className='shadow-md border rounded-2xl min-h-[400px] bg-white pb-[5rem]'>
						<h2 className='font-medium mb-2 mt-6 ml-5'>
							Consultations by Status
						</h2>
						{statusPercents.length ? (
							<div
								style={{
									width: '100%',
									height: '100%',
									minWidth: 0,
									minHeight: chartHeight,
								}}
							>
								<ResponsiveContainer minWidth={0} width='100%' height='100%'>
									<PieChart>
										<Pie
											data={statusPercents}
											dataKey='value'
											nameKey='name'
											cx='50%'
											cy='50%'
											outerRadius='70%'
											label={({ name, percent }) => `${name}: ${percent}%`}
										>
											{statusPercents.map((_, idx) => (
												<Cell
													key={`cell-status-${idx}`}
													fill={PIE_COLORS[idx % PIE_COLORS.length]}
												/>
											))}
										</Pie>
										<Legend
											verticalAlign='bottom'
											wrapperStyle={{ fontSize: 12 }}
										/>
										<Tooltip
											formatter={(v: any, name: any, props: any) => [
												`${props.payload.percent}% (${v})`,
												name,
											]}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
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
					<section className='shadow-md border rounded-2xl min-h-[400px] bg-white pb-[5rem]'>
						<h2 className='font-medium mb-2 mt-6 ml-5'>
							Consultations by Instructor
						</h2>
						{instructorData.length ? (
							<div
								style={{
									width: '100%',
									minWidth: 0,
									height: '100%',
									minHeight: chartHeight,
								}}
							>
								<ResponsiveContainer width='100%' height='100%'>
									<BarChart
										data={instructorData}
										margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
									>
										<CartesianGrid strokeDasharray='5 5' />
										<XAxis
											dataKey='name'
											tick={{ fontSize: 12, fill: 'black' }}
											interval={0}
										/>
										<YAxis />
										<Tooltip />
										<Legend wrapperStyle={{ color: 'black', fontSize: 12 }} />
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
							</div>
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

				{/* Right Column: sticky header + scrollable content */}
				<div
					className='w-[30%]'
					// style={{
					// 	flex: '1 1 260px',
					// 	display: 'flex',
					// 	flexDirection: 'column',
					// 	gap: '1rem',
					// 	minWidth: 0,
					// 	marginTop: '3rem',
					// 	position: 'sticky',
					// 	top: '2rem',
					// 	height: 'fit-content',
					// }}
				>
					<Card>
						<CardContent>
							<h2 className='font-medium mb-2'>General Reports</h2>
							<div className='text-sm mb-3'>
								<p>
									Total Consultations: <strong>{totalConsultations}</strong>
								</p>
								<p>
									Total Instructors: <strong>{instructorSet.size}</strong>
								</p>
								<p>
									Total Students: <strong>{studentSet.size}</strong>
								</p>
								<p>
									Average Consultations: <strong>{avgPerInstructor}</strong>
								</p>
							</div>
							<GenerateReportFormAdmin />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
