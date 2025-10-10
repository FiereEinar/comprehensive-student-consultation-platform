import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

function App() {
	return (
		<main className='flex min-h-screen'>
			<Sidebar />
			<div className='min-h-screen flex flex-col p-5'>
				<Outlet />
			</div>
		</main>
	);
}

export default App;
