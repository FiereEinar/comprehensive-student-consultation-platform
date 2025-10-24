import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, CheckCheck } from 'lucide-react';
import { startCase } from 'lodash';
import type { ConsultationStatus } from '@/types/consultation';

interface StatusBadgeProps {
	status: ConsultationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
	const getStatusDetails = (status: ConsultationStatus) => {
		switch (status) {
			case 'pending':
				return { icon: Clock, color: 'bg-yellow-500/10 text-yellow-600' };
			case 'accepted':
				return { icon: CheckCircle, color: 'bg-blue-500/10 text-blue-600' };
			case 'declined':
				return { icon: XCircle, color: 'bg-red-500/10 text-red-600' };
			case 'completed':
				return { icon: CheckCheck, color: 'bg-green-500/10 text-green-600' };
			default:
				return { icon: Clock, color: 'bg-gray-500/10 text-gray-600' };
		}
	};

	const { icon: Icon, color } = getStatusDetails(status);

	return (
		<Badge variant='outline' className={color}>
			<Icon />
			<span>{startCase(status)}</span>
		</Badge>
	);
}
