import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { setNavigate } from './lib/navigate';

function App() {
	const navigate = useNavigate();
	setNavigate(navigate);

	return (
		<main className='flex min-h-screen bg-[#FAF2F7]'>
			<Sidebar />

			<div className='h-screen flex flex-col w-full'>
				<TopBar />
				<div className='flex flex-col p-5 overflow-y-scroll'>
					<Outlet />
				</div>
			</div>
		</main>
	);
}

export default App;
