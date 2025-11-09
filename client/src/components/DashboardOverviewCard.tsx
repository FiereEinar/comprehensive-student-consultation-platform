import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function DashboardOverviewCard({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: ReactNode;
}) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0'>
				<CardTitle className='text-sm font-medium text-muted-foreground flex gap-2 items-center'>
					{icon}
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='font-semibold'>{value}</div>
			</CardContent>
		</Card>
	);
}
