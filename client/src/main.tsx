import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Route from './Route.tsx';
import { ThemeProvider } from './components/providers/ThemeProvider.tsx';
import { Toaster } from './components/ui/sonner.tsx';

export const queryClient = new QueryClient();
const rootElement = document.getElementById('root') as HTMLElement;

let root = (rootElement as any)._reactRoot ?? createRoot(rootElement);
(rootElement as any)._reactRoot = root;

root.render(
	<StrictMode>
		<ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
			<QueryClientProvider client={queryClient}>
				<Route />
				<Toaster />
			</QueryClientProvider>
		</ThemeProvider>
	</StrictMode>
);
