import { Outlet, useNavigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import { setNavigate } from './lib/navigate';
import { AppSidebar } from './components/AppSidebar';

function App() {
	const navigate = useNavigate();
	setNavigate(navigate);

	return (
		<main className='flex w-full min-h-screen bg-[#FAF2F7]'>
			<AppSidebar />

			<div className='h-screen flex flex-col w-full'>
				<TopBar />
				<div className='flex flex-col p-8 overflow-y-auto'>
					<Outlet />
				</div>
			</div>
		</main>
	);
}

export default App;
