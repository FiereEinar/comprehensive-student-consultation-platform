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
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import AcceptInstructorInvitation from './pages/AcceptInstructorInvitation';
import AdminInstructorsPage from './pages/AdminInstructorsPage';
import Subjects from './pages/Subjects';

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
					path: '/admin/instructors',
					element: <AdminInstructorsPage />,
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
					path: '/instructor/subject',
					element: <Subjects />,
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
		{
			path: '/forgot-password',
			element: <ForgotPassword />,
		},
		{
			path: '/reset-password/:token',
			element: <PasswordReset />,
		},
		{
			path: '/invite/instructor/accept',
			element: <AcceptInstructorInvitation />,
		},
	]);

	return <RouterProvider router={route} />;
}
