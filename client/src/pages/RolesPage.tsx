import { useQuery } from '@tanstack/react-query';
import { MODULES, QUERY_KEYS } from '@/constants';
import { fetchRoles } from '@/api/role';
import Header from '@/components/ui/header';
import CreateRoleForm from '@/components/forms/CreateRoleForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState } from 'react';
import type { Role } from '@/api/role';
import RoleCard from '@/components/RoleCard';
import RoleSheet from '@/components/RoleSheet';
import HasPermission from '@/components/HasPermission';

export default function RolesPage() {
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const { data: roles, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.ROLES],
		queryFn: () => fetchRoles(),
	});

	const handleRoleClick = (role: Role) => {
		setSelectedRole(role);
		setSheetOpen(true);
	};

	return (
		<>
			<section className='space-y-5'>
				<div className='flex w-full justify-between'>
					<Header size='md'>Manage Roles</Header>
					<HasPermission
						userRole={['admin']}
						permissions={[MODULES.CREATE_ROLE]}
					>
						<CreateRoleForm />
					</HasPermission>
				</div>

				<div className='border-2 p-3 bg-white rounded-2xl'>
					<div className='space-y-2'>
						{isLoading ? (
							<LoadingSpinner />
						) : roles?.length === 0 ? (
							<p className='text-center p-5 text-muted-foreground italic'>
								No roles found
							</p>
						) : (
							<>
								{roles &&
									roles.map((role) => (
										<div
											key={role._id}
											onClick={() => handleRoleClick(role)}
											className='cursor-pointer'
										>
											<RoleCard
												name={role.name}
												description={role.description}
												permissionsCount={role.permissions?.length ?? 0}
											/>
										</div>
									))}
							</>
						)}
					</div>
				</div>
			</section>

			<RoleSheet
				role={selectedRole}
				open={sheetOpen}
				onOpenChange={setSheetOpen}
			/>
		</>
	);
}
