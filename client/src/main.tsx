import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { QueryClient } from '@tanstack/react-query';
import Route from './Route.tsx';

export const queryClient = new QueryClient();
const rootElement = document.getElementById('root') as HTMLElement;

let root = (rootElement as any)._reactRoot ?? createRoot(rootElement);
(rootElement as any)._reactRoot = root;

root.render(
	<StrictMode>
		<Route />
	</StrictMode>
);
