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
  Pie 
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
      fontSize="14px"
      textAnchor="middle"
      dominantBaseline="central"
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
        minHeight: '100vh', 
        width: '100vw',  // Keeping this as is, per your instruction not to increase width
      }}
    >
      {/* First half: RadialBarChart and PieChart */}
      <div 
        style={{
          flex: 1,  // Equal split, no changes
          padding: '20px', 
          overflow: 'auto', 
          borderRight: '1px solid #ccc',
        }}
      >
        <Header>Admin Consultations</Header>
        <h2>First Half: Graphs Overview</h2>  {/* Renamed for clarity */}
        
        {/* RadialBarChart */}
        <ResponsiveContainer width="100%" height={250}>
          <RadialBarChart 
            innerRadius={20} 
            outerRadius={140} 
            data={sampleInstructors} 
            startAngle={0} 
            endAngle={360}
          >
            <>
              <RadialBar
                label={customLabel}
                background
                dataKey="consultations"
              >
                {sampleInstructors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RadialBar>
              <Legend />
              <Tooltip />
            </>
          </RadialBarChart>
        </ResponsiveContainer>
        
        {/* PieChart */}
        <div style={{ marginTop: '20px' }}>  {/* Added margin for spacing */}
          <h3>Percentage of Total Generated Consultations</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          flex: 1,  // Equal split, no changes
          padding: '20px', 
          overflow: 'auto', 
        }}
      >
        <h2>Second Half: Reports and Form</h2>  {/* Renamed for clarity */}
        
        {/* BarChart */}
        <div style={{ marginTop: '20px' }}>
          <h3>Other Consultation Reports</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* ConsultationFormAdmin */}
        <div style={{ marginTop: '40px' }}>
          <ConsultationFormAdmin />
        </div>
      </div>
    </div>
  );
}
  