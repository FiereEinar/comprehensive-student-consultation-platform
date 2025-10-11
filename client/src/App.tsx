import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

function App() {
	return (
		<main className='flex min-h-screen bg-[#FAF2F7]'>
			<Sidebar />

			<div className='min-h-screen flex flex-col w-full'>
				<TopBar />
				<div className='flex flex-col p-5'>
					<Outlet />
				</div>
			</div>
		</main>
	);
}

export default App;
