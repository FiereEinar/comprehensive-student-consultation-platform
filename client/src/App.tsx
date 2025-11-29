
import { Outlet, useNavigate } from 'react-router-dom';

import TopBar from './components/TopBar';
import { setNavigate } from './lib/navigate';
import { AppSidebar } from './components/sidebars/AppSidebar';

function App() {
 const navigate = useNavigate();
 setNavigate(navigate);

	return (
		<main className='flex w-full bg-[#FAF2F7]'>
			<AppSidebar />

			<div className='flex flex-col w-full'>
				<div className='sticky top-0 z-50'>
					<TopBar />
				</div>
				<div className='flex flex-col p-8'>
					<Outlet />
				</div>
			</div>
		</main>
	);
}

export default App;
