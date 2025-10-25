import React from 'react';
import Header from '@/components/ui/header';
import {
	RadialBarChart,
	RadialBar,
	Legend,
	Tooltip,
	ResponsiveContainer,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	PieChart,
	Pie,
} from 'recharts';
import ConsultationFormAdmin from '@/components/forms/ConsultationFormAdmin';

interface Instructor {
	id: number;
	name: string;
	consultations: number;
	rating: number;
	[key: string]: any;
}

const sampleInstructors: Instructor[] = [
	{ id: 1, name: 'Marilou O. Espina', consultations: 15, rating: 4.7 },
	{ id: 2, name: 'Clifford Baguio', consultations: 8, rating: 3.9 },
	{ id: 3, name: 'Joan Panes', consultations: 22, rating: 4.5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const customLabel = (props: any) => {
	const { name, index, x, y } = props || {};
	const color = COLORS[(index || 0) % COLORS.length];
	return (
		<text
			x={x || 0}
			y={y || 0}
			fill={color || COLORS[0]}
			fontSize='14px'
			textAnchor='middle'
			dominantBaseline='central'
		>
			{name || 'Label'}
		</text>
	);
};

const pieChartData = [
	{ name: 'Completed Consultations', value: 45 },
	{ name: 'Remaining', value: 55 },
];

const barChartData = [
	{ name: 'Consultations Cancelled', value: 15 },
	{ name: 'Marked as Done Consultations', value: 50 },
	{ name: 'Student-Teacher Consultations', value: 100 },
	{ name: 'Students Consulted This Year', value: 250 },
	{ name: 'Total Consultation Transactions', value: 150 },
];

export default function AdminConsultations() {
	return (
		<div
			style={{
				display: 'flex',
				// minHeight: '100vh'
			}}
		>
			<div
				style={{
					flex: 1, // Equal split, no changes
					padding: '20px',
					overflow: 'auto',
				}}
			>
				<Header size='md'>Admin Consultations</Header>
				<h2>First Half: Graphs Overview</h2> {/* Renamed for clarity */}
				{/* RadialBarChart */}
				<ResponsiveContainer width='100%' height={350}>
					<RadialBarChart
						innerRadius={20}
						outerRadius={140}
						data={sampleInstructors}
						startAngle={0}
						endAngle={360}
					>
						<>
							<RadialBar label={customLabel} background dataKey='consultations'>
								{sampleInstructors.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</RadialBar>
							<Legend />
							<Tooltip />
						</>
					</RadialBarChart>
				</ResponsiveContainer>
				{/* PieChart */}
				<div style={{ marginTop: '20px' }}>
					{' '}
					{/* Added margin for spacing */}
					<h3>Percentage of Total Generated Consultations</h3>
					<ResponsiveContainer width='100%' height={250}>
						<PieChart>
							<>
								<Pie
									data={pieChartData}
									dataKey='value'
									nameKey='name'
									cx='50%'
									cy='50%'
									outerRadius={80}
									fill='#8884d8'
								>
									{pieChartData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Second half: BarChart and ConsultationFormAdmin */}
			<div
				style={{
					flex: 1, // Equal split, no changes
				}}
			>
				<h2>Reports and Form</h2> {/* Renamed for clarity */}
				<div style={{ flex: 1, overflow: 'auto' }}>
					<h2>Reports Overview</h2>
					{/* Static display of generated reports with additional content */}
					<div>
						<h3>Generated Reports</h3>
						<p>
							<strong>Percent of Total Generated Consultations:</strong> 45%
						</p>
						<p>
							<strong>Number of Consultations Cancelled:</strong> 15
						</p>
						<p>
							<strong>Number of Students Consulted This Year:</strong> 250
						</p>
						<p>
							<strong>How Many Marked as Done Consultations:</strong> 50
						</p>{' '}
						{/* New report as requested */}
						<p>
							<strong>Number of Student-Teacher Consultations:</strong> 100
						</p>{' '}
						{/* Additional related content */}
						<p>
							<strong>Total Consultation Transactions:</strong> 150
						</p>{' '}
						{/* Additional related content */}
					</div>
					{/* Include ConsultationFormAdmin component */}
					<ConsultationFormAdmin />{' '}
					{/* Renders the form with modal content as per your file */}
				</div>
			</div>
		</div>
	);
}
