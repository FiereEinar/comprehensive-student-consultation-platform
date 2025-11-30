import type { Modules } from '@/constants';
import { useUserStore } from '@/stores/user';
import type { UserTypes } from '@/types/user';
import type { ReactNode } from 'react';

type Props = {
	permissions?: Modules[]; // optional
	userRole?: UserTypes[]; // optional
	children: ReactNode;
	fallback?: ReactNode;
};

export default function HasPermission({
	permissions = [],
	userRole = [],
	children,
	fallback = null,
}: Props) {
	const { user } = useUserStore((state) => state);

	if (!user) return fallback;

	// --- Role Check (applies to all users)
	if (userRole.length > 0 && !userRole.includes(user.role)) {
		return fallback;
	}

	// --- Permission Check (admin only)
	if (user.role === 'admin' && permissions.length > 0) {
		const userPerms = user.adminRole?.permissions ?? [];
		const hasPerm = permissions.some((p) => userPerms.includes(p));
		if (!hasPerm) return fallback;
	}

	return children;
}
