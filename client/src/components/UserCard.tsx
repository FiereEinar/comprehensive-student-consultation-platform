import { Card, CardContent } from '@/components/ui/card';
import { UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { startCase } from 'lodash';

type UserCardProps = {
	name: string;
	email: string;
	profilePicture?: string;
	status?: 'active' | 'pending' | 'expired' | 'accepted';
	createdAt?: Date; // For invitations (sent time)
};

export default function UserCard({
	name,
	email,
	profilePicture,
	status = 'active',
	createdAt,
}: UserCardProps) {
	return (
		<Card className='py-3'>
			<CardContent className='flex items-center justify-between gap-4 px-4'>
				{/* LEFT SIDE — Avatar + Name + Email */}
				<div className='flex items-center gap-3'>
					{profilePicture ? (
						<img
							src={profilePicture}
							className='w-10 h-10 object-cover rounded-full'
						/>
					) : (
						<UserRound className='w-8 h-8 text-muted-foreground' />
					)}

					<div className='flex flex-col'>
						<p className='font-semibold'>{startCase(name)}</p>
						<p className='text-sm text-muted-foreground'>{email}</p>
					</div>
				</div>

				{/* RIGHT SIDE — Status + Sent Time (optional) */}
				<div className='flex flex-col items-end gap-1 text-sm'>
					{/* STATUS BADGE */}
					<Badge
						variant={
							status === 'active'
								? 'default'
								: status === 'pending'
								? 'outline'
								: 'secondary'
						}
					>
						{startCase(status)}
					</Badge>

					{/* SENT TIME FOR INVITATIONS */}
					{createdAt && status !== 'active' && (
						<p className='text-muted-foreground text-xs'>
							{formatDistanceToNow(new Date(createdAt), {
								addSuffix: true,
							})}
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
