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
import InstructorConsultations from './pages/consultations/InstructorConsultations';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import AcceptInstructorInvitation from './pages/AcceptInstructorInvitation';
import AdminInstructorsPage from './pages/AdminInstructorsPage';
import Logs from './pages/Logs';
import InstructorAvailability from './pages/InstructorAvailability';
import { useUserStore } from './stores/user';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminBackupPage from './pages/AdminBackupPage';
import ManageUsersPage from './pages/ManageUsersPage';
import RolesPage from './pages/RolesPage';
import NotFound from './pages/NotFound';
import HasPermission from './components/HasPermission';
import NoPermission from './pages/NoPermission';
import { MODULES } from './constants';

export default function Route() {
	const { user } = useUserStore((state) => state);

	let redirectTo = '/';

	user?.role === 'instructor'
		? (redirectTo = '/instructor/dashboard')
		: user?.role === 'student'
		? (redirectTo = '/student/dashboard')
		: user?.role === 'admin'
		? (redirectTo = '/admin/dashboard')
		: (redirectTo = '/');

	const route = createBrowserRouter([
		{
			path: '/',
			errorElement: <NotFound />,
			element: (
				<ProtectedRoute>
					<App />
				</ProtectedRoute>
			),
			children: [
				{
					index: true,
					element: <Navigate to={redirectTo} />,
				},
				{
					path: '/admin',
					element: <Navigate to='/admin/dashboard' replace />,
				},
				{
					path: '/admin/dashboard',
					element: (
						<HasPermission userRole={['admin']} fallback={<NoPermission />}>
							<AdminDashboard />
						</HasPermission>
					),
				},
				{
					path: '/admin/consultation',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_CONSULTATION]}
							fallback={<NoPermission />}
						>
							<AdminConsultations />
						</HasPermission>
					),
				},
				{
					path: '/admin/instructors',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_USER]}
							fallback={<NoPermission />}
						>
							<AdminInstructorsPage />
						</HasPermission>
					),
				},
				{
					path: '/admin/logs',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_LOG]}
							fallback={<NoPermission />}
						>
							<Logs />
						</HasPermission>
					),
				},
				{
					path: '/admin/reports',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.GET_CONSULTATION_REPORT]}
							fallback={<NoPermission />}
						>
							<AdminReportsPage />
						</HasPermission>
					),
				},
				{
					path: '/admin/backups',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_BACKUP]}
							fallback={<NoPermission />}
						>
							<AdminBackupPage />
						</HasPermission>
					),
				},
				{
					path: '/admin/users',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_USER]}
							fallback={<NoPermission />}
						>
							<ManageUsersPage />
						</HasPermission>
					),
				},
				{
					path: '/admin/roles',
					element: (
						<HasPermission
							userRole={['admin']}
							permissions={[MODULES.READ_ROLE]}
							fallback={<NoPermission />}
						>
							<RolesPage />
						</HasPermission>
					),
				},
				{
					path: '/student/dashboard',
					element: (
						<HasPermission userRole={['student']} fallback={<NoPermission />}>
							<StudentDashboard />
						</HasPermission>
					),
				},
				{
					path: '/student/consultation',
					element: (
						<HasPermission userRole={['student']} fallback={<NoPermission />}>
							<StudentConsultations />
						</HasPermission>
					),
				},
				{
					path: '/instructor/dashboard',
					element: (
						<HasPermission
							userRole={['instructor']}
							fallback={<NoPermission />}
						>
							<InstructorDashbaord />
						</HasPermission>
					),
				},
				{
					path: '/instructor/consultation',
					element: (
						<HasPermission
							userRole={['instructor']}
							fallback={<NoPermission />}
						>
							<InstructorConsultations />
						</HasPermission>
					),
				},
				{
					path: '/instructor/availability',
					element: (
						<HasPermission
							userRole={['instructor']}
							fallback={<NoPermission />}
						>
							<InstructorAvailability />
						</HasPermission>
					),
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
