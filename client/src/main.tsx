import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Route from './Route.tsx';
import { ThemeProvider } from './components/providers/ThemeProvider.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { SidebarProvider } from './components/ui/sidebar.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { initGA } from './utils/analytics';

export const queryClient = new QueryClient();
const rootElement = document.getElementById('root') as HTMLElement;

let root = (rootElement as any)._reactRoot ?? createRoot(rootElement);
(rootElement as any)._reactRoot = root;

initGA();

root.render(
	<StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
				<QueryClientProvider client={queryClient}>
					<SidebarProvider>
						<Route />
						<Toaster />
					</SidebarProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</GoogleOAuthProvider>
	</StrictMode>
);
