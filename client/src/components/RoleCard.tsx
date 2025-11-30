import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type RoleCardProps = {
	name: string;
	description?: string;
	permissionsCount: number;
};

export default function RoleCard({
	name,
	description,
	permissionsCount,
}: RoleCardProps) {
	return (
		<Card className='py-3'>
			<CardContent className='flex items-center justify-between gap-4 px-4'>
				{/* LEFT SIDE — Icon + Name + Description */}
				<div className='flex items-center gap-3'>
					<Shield className='w-8 h-8 text-muted-foreground' />

					<div className='flex flex-col'>
						<p className='font-medium'>{name}</p>
						{description && (
							<p className='text-sm text-muted-foreground'>{description}</p>
						)}
					</div>
				</div>

				{/* RIGHT SIDE — Permissions Count */}
				<div className='flex flex-col items-end gap-1 text-sm'>
					<Badge variant='outline'>
						{permissionsCount} permission{permissionsCount !== 1 ? 's' : ''}
					</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
