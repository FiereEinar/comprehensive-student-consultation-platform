import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Shield, Save, Trash } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, MODULES } from '@/constants';
import { deleteRole, updateRole } from '@/api/role';
import type { Role } from '@/api/role';
import { useEffect } from 'react';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import HasPermission from './HasPermission';

// Schema for updating role
const updateRoleSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	permissions: z
		.array(z.string())
		.min(1, 'At least one permission is required'),
});

export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

type RoleSheetProps = {
	role: Role | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function RoleSheet({
	role,
	open,
	onOpenChange,
}: RoleSheetProps) {
	const queryClient = useQueryClient();

	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<UpdateRoleFormValues>({
		resolver: zodResolver(updateRoleSchema),
		defaultValues: {
			name: role?.name || '',
			description: role?.description || '',
			permissions: role?.permissions || [],
		},
	});

	// Update role mutation
	const updateRoleMutation = useMutation({
		mutationFn: async (data: UpdateRoleFormValues) => {
			if (!role) throw new Error('No role selected');
			return updateRole(role._id, data);
		},
		onSuccess: () => {
			toast.success('Role updated successfully');
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error.message ?? 'Failed to update role');
		},
	});

	const onSubmit = (data: UpdateRoleFormValues) => {
		updateRoleMutation.mutate(data);
	};

	// Reset form when role changes
	useEffect(() => {
		if (role) {
			reset({
				name: role.name,
				description: role.description || '',
				permissions: role.permissions || [],
				// permissions: role.permissions?.map((p: any) => p._id) || [],
			});
		}
	}, [role, reset]);

	if (!role) return null;

	// Group permissions by module
	const moduleGroups = {
		Consultation: Object.entries(MODULES).filter(([key]) =>
			key.includes('CONSULTATION')
		),
		User: Object.entries(MODULES).filter(([key]) => key.includes('USER')),
		Role: Object.entries(MODULES).filter(([key]) => key.includes('ROLE')),
		Log: Object.entries(MODULES).filter(([key]) => key.includes('LOG')),
		Backup: Object.entries(MODULES).filter(([key]) => key.includes('BACKUP')),
	};

	const handleDeleteRole = async () => {
		try {
			await deleteRole(role._id);
			toast.success('Role deleted successfully!');
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ROLES] });
			onOpenChange(false);
		} catch (error: any) {
			toast.error(error.message ?? 'Failed to delete role');
			console.error(error);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className='flex items-center gap-3'>
						<Shield className='w-8 h-8 text-muted-foreground' />
						<div>
							<div>Edit Role</div>
							<div className='text-sm font-normal text-muted-foreground'>
								{role.name}
							</div>
						</div>
					</SheetTitle>
					<SheetDescription>
						Edit role details and manage permissions.
					</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='space-y-6 px-5 overflow-y-scroll'>
					{/* Edit Form */}
					<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
						{/* NAME */}
						<Controller
							name='name'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>Role Name</FieldLabel>
									<Input
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder='e.g., Moderator'
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* DESCRIPTION */}
						<Controller
							name='description'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor={field.name}>
										Description (Optional)
									</FieldLabel>
									<Textarea
										{...field}
										id={field.name}
										aria-invalid={fieldState.invalid}
										placeholder='Describe the role...'
										rows={3}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* PERMISSIONS */}
						<Controller
							name='permissions'
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel>Permissions</FieldLabel>
									<div className='space-y-4'>
										{Object.entries(moduleGroups).map(
											([moduleName, permissions]) => (
												<div key={moduleName} className='space-y-2'>
													<h4 className='font-medium text-sm'>
														{moduleName} Module
													</h4>
													<div className='grid grid-cols-1 gap-2 pl-4'>
														{permissions.map(([key, value]) => (
															<div
																key={key}
																className='flex items-center space-x-2'
															>
																<Checkbox
																	id={value}
																	checked={field.value.includes(value)}
																	onCheckedChange={(checked) => {
																		const newValue = checked
																			? [...field.value, value]
																			: field.value.filter(
																					(id) => id !== value
																			  );
																		field.onChange(newValue);
																	}}
																/>
																<label
																	htmlFor={value}
																	className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
																>
																	{value}
																</label>
															</div>
														))}
													</div>
												</div>
											)
										)}
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{/* Account Info */}
						<div className='text-sm text-muted-foreground space-y-1'>
							<p>Created: {new Date(role.createdAt).toLocaleDateString()}</p>
							<p>
								Last Updated: {new Date(role.updatedAt).toLocaleDateString()}
							</p>
						</div>

						{/* Save Button */}
						<div className='flex justify-end pt-4 mb-5 gap-2'>
							<HasPermission
								userRole={['admin']}
								permissions={[MODULES.DELETE_ROLE]}
							>
								<ConfirmDeleteDialog
									onConfirm={handleDeleteRole}
									trigger={
										<Button
											size='sm'
											variant='link'
											type='button'
											className='text-red-500 text-xs'
											disabled={isSubmitting || updateRoleMutation.isPending}
										>
											<Trash className='w-4 h-4' /> Delete Role
										</Button>
									}
								/>
							</HasPermission>

							<HasPermission
								userRole={['admin']}
								permissions={[MODULES.UPDATE_ROLE]}
							>
								<Button
									size='sm'
									type='submit'
									disabled={isSubmitting || updateRoleMutation.isPending}
								>
									<Save className='w-4 h-4 mr-2' />
									Save Changes
								</Button>
							</HasPermission>
						</div>
					</form>
				</div>
			</SheetContent>
		</Sheet>
	);
}
