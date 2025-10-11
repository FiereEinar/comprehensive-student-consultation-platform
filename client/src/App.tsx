import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { UserRound } from 'lucide-react';

function App() {
	return (
		<main className='flex min-h-screen bg-[#FAF2F7]'>
			<Sidebar />
			<div className='min-h-screen flex flex-col w-full'>
				<div className='bg-white p-2 pr-5 w-full flex justify-end'>
					<div className='flex items-center text-end gap-2'>
						<div>
							<p>Fern Aila Asinero</p>
							<p className='text-xs'>My Love</p>
						</div>
						<div className='rounded-full p-1 border-black border-2'>
							<UserRound />
						</div>
					</div>
				</div>
				<div className='flex flex-col p-5'>
					<Outlet />
				</div>
			</div>
		</main>
	);
}

export default App;
