import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminConsultations from './pages/consultations/AdminConsultations';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import StudentConsultations from './pages/consultations/StudentConsultations';
import InstructorDashbaord from './pages/dashboards/InstructorDashboard';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import InstructorConsultations2 from './pages/consultations/InstructorConsultations2';
import InstructorConsultations from './pages/consultations/InstructorConsultations';

export default function Route() {
	const route = createBrowserRouter([
		{
			path: '/',
			element: (
				<ProtectedRoute>
					<App />
				</ProtectedRoute>
			),
			children: [
				{
					index: true,
					element: <Navigate to='/student/consultation' />,
				},
				{
					path: '/admin/dashboard',
					element: <AdminDashboard />,
				},
				{
					path: '/admin/consultation',
					element: <AdminConsultations />,
				},
				{
					path: '/student/dashboard',
					element: <StudentDashboard />,
				},
				{
					path: '/student/consultation',
					element: <StudentConsultations />,
				},
				{
					path: '/instructor/dashboard',
					element: <InstructorDashbaord />,
				},
				{
					path: '/instructor/consultation2',
					element: <InstructorConsultations2 />,
				},
				{
					path: '/instructor/consultation',
					element: <InstructorConsultations />,
				},
				{
					path: '/settings',
					element: <Settings />,
				},
			],
		},
		{
			path: '/login',
			element: <Login />,
		},
		{
			path: '/signup',
			element: <Signup />,
		},
	]);

	return <RouterProvider router={route} />;
}
