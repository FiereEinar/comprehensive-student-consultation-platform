import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { UserRound, Archive, ArchiveRestore, Key, Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MODULES, QUERY_KEYS } from '@/constants';
import axiosInstance from '@/api/axios';
import type { User } from '@/types/user';
import { startCase } from 'lodash';
import { useEffect, useState } from 'react';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { fetchRoles } from '@/api/role';
import HasPermission from './HasPermission';

// Schema for updating user
const updateUserSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	institutionalID: z.string().min(1, 'Institutional ID is required'),
	email: z.email('Invalid email').optional().or(z.literal('')),
	role: z.enum(['admin', 'student', 'instructor'], 'Role is required'),
	adminRole: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

type UserSheetProps = {
	user: User | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function UserSheet({
	user,
	open,
	onOpenChange,
}: UserSheetProps) {
	const queryClient = useQueryClient();
	const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
	const [newPassword, setNewPassword] = useState('');

	const { data: roles } = useQuery({
		queryKey: [QUERY_KEYS.ROLES],
		queryFn: async () => {
			const res = await fetchRoles();
			return res;
		},
	});

	const {
		control,
		handleSubmit,
		watch,
		reset,
		formState: { isSubmitting },
	} = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: user?.name || '',
			institutionalID: user?.institutionalID || '',
			email: user?.email || '',
			role: user?.role || 'student',
			adminRole: user?.adminRole?._id.toString() || '',
		},
	});

	const selectedRole = watch('role');

	// Update user mutation
	const updateUserMutation = useMutation({
		mutationFn: async (data: UpdateUserFormValues) => {
			const { data: response } = await axiosInstance.patch(
				`/user/${user?._id}/admin`,
				data,
			);
			return response;
		},
		onSuccess: () => {
			toast.success('User updated successfully');
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error.message ?? 'Failed to update user');
		},
	});

	// Archive user mutation
	const archiveUserMutation = useMutation({
		mutationFn: async (archived: boolean) => {
			const { data: response } = await axiosInstance.patch(
				`/user/${user?._id}/archive`,
				{ archived },
			);
			return response;
		},
		onSuccess: (_, archived) => {
			toast.success(
				`User ${archived ? 'archived' : 'unarchived'} successfully`,
			);
			queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			toast.error(error.message ?? 'Failed to update user status');
		},
	});

	// Reset password mutation
	const resetPasswordMutation = useMutation({
		mutationFn: async (newPassword: string) => {
			const { data: response } = await axiosInstance.patch(
				`/user/${user?._id}/admin/password`,
				{ newPassword },
			);
			return response;
		},
		onSuccess: () => {
			toast.success('Password reset successfully');
		},
		onError: (error: any) => {
			toast.error(error.message ?? 'Failed to reset password');
		},
	});

	const onSubmit = (data: UpdateUserFormValues) => {
		updateUserMutation.mutate(data);
	};

	const handleResetPassword = () => {
		setResetPasswordDialogOpen(true);
	};

	const handleConfirmResetPassword = () => {
		if (newPassword.length >= 6) {
			resetPasswordMutation.mutate(newPassword);
			setResetPasswordDialogOpen(false);
			setNewPassword('');
		} else {
			toast.error('Password must be at least 6 characters');
		}
	};

	const handleArchive = () => {
		archiveUserMutation.mutate(!user?.archived);
	};

	// Reset form when user changes
	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				institutionalID: user.institutionalID,
				email: user.email || '',
				role: user.role,
				adminRole: user.adminRole?._id.toString() || '',
			});
		}
	}, [user, reset]);

	if (!user) return null;

	return (
		<>
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle className='flex items-center gap-3'>
							{user.profilePicture ? (
								<img
									src={user.profilePicture}
									className='w-10 h-10 object-cover rounded-full'
								/>
							) : (
								<UserRound className='w-8 h-8 text-muted-foreground' />
							)}
							<div>
								<div>{startCase(user.name)}</div>
								<div className='text-sm font-normal text-muted-foreground'>
									{user.institutionalID}
								</div>
							</div>
						</SheetTitle>
						<div className='flex items-center gap-2'>
							<span className='text-sm font-medium'>Status:</span>
							<Badge variant={user.archived ? 'secondary' : 'default'}>
								{user.archived ? 'Archived' : 'Active'}
							</Badge>
							<Badge variant='outline'>{startCase(user.role)}</Badge>
						</div>
						<SheetDescription>
							View and manage user details and permissions.
						</SheetDescription>
					</SheetHeader>

					<div className='space-y-6 px-5 overflow-y-auto'>
						{/* User Status */}
						<div className='flex items-center justify-end'>
							<div className='flex gap-2'>
								<HasPermission
									userRole={['admin']}
									permissions={[MODULES.UPDATE_USER]}
								>
									<Button
										size='sm'
										variant='link'
										className='text-xs text-black'
										onClick={handleResetPassword}
										disabled={resetPasswordMutation.isPending}
									>
										<Key className='w-4 h-4' />
										Reset Password
									</Button>
								</HasPermission>

								<HasPermission
									userRole={['admin']}
									permissions={[MODULES.ARCHIVE_USER]}
								>
									<ConfirmDeleteDialog
										onConfirm={handleArchive}
										trigger={
											<Button
												size='sm'
												className={`${
													!user.archived
														? 'text-red-500'
														: 'text-custom-primary'
												} text-xs`}
												variant='link'
												disabled={archiveUserMutation.isPending}
											>
												{user.archived ? (
													<>
														<ArchiveRestore className='w-4 h-4' />
														Unarchive
													</>
												) : (
													<>
														<Archive className='w-4 h-4' />
														Archive
													</>
												)}
											</Button>
										}
									/>
								</HasPermission>
							</div>
						</div>

						<Separator />

						{/* Edit Form */}
						<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
							{/* NAME */}
							<Controller
								name='name'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder='John Doe'
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							{/* INSTITUTIONAL ID */}
							<Controller
								name='institutionalID'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>
											Institutional ID
										</FieldLabel>
										<Input
											{...field}
											id={field.name}
											aria-invalid={fieldState.invalid}
											placeholder='20210001'
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							{/* EMAIL */}
							<Controller
								name='email'
								control={control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor={field.name}>Email</FieldLabel>
										<Input
											{...field}
											id={field.name}
											type='email'
											aria-invalid={fieldState.invalid}
											placeholder='john.doe@university.edu'
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>

							<HasPermission
								userRole={['admin']}
								permissions={[MODULES.ASSIGN_ROLE]}
							>
								{/* ROLE */}
								<Controller
									name='role'
									control={control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor={field.name}>Role</FieldLabel>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger
													className='w-full cursor-pointer'
													data-invalid={fieldState.invalid}
												>
													<SelectValue placeholder='Select Role' />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>User Roles</SelectLabel>
														<SelectItem
															value='student'
															className='cursor-pointer'
														>
															Student
														</SelectItem>
														<SelectItem
															value='instructor'
															className='cursor-pointer'
														>
															Instructor
														</SelectItem>
														<SelectItem
															value='admin'
															className='cursor-pointer'
														>
															Admin
														</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>

								{/* ADMIN ROLES */}
								{selectedRole === 'admin' && (
									<Controller
										name='adminRole'
										control={control}
										render={({ field, fieldState }) => (
											<Field data-invalid={fieldState.invalid}>
												<FieldLabel htmlFor={field.name}>Admin Role</FieldLabel>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<SelectTrigger
														className='w-full cursor-pointer'
														data-invalid={fieldState.invalid}
													>
														<SelectValue placeholder='Select Admin Role' />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Admin Role</SelectLabel>
															{roles?.map((role) => (
																<SelectItem
																	key={role._id}
																	value={role._id}
																	className='cursor-pointer'
																>
																	{startCase(role.name)}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
												{fieldState.invalid && (
													<FieldError errors={[fieldState.error]} />
												)}
											</Field>
										)}
									/>
								)}
							</HasPermission>

							{/* Account Info */}
							<div className='text-sm text-muted-foreground space-y-1'>
								<p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
								<p>
									Last Updated: {new Date(user.updatedAt).toLocaleDateString()}
								</p>
							</div>

							{/* Save Button */}
							<div className='flex justify-end pt-4 mb-5'>
								<HasPermission
									userRole={['admin']}
									permissions={[MODULES.UPDATE_USER]}
								>
									<Button
										type='submit'
										disabled={isSubmitting || updateUserMutation.isPending}
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

			<ResetPasswordDialog
				open={resetPasswordDialogOpen}
				onOpenChange={setResetPasswordDialogOpen}
				user={user}
				newPassword={newPassword}
				setNewPassword={setNewPassword}
				onConfirm={handleConfirmResetPassword}
				isPending={resetPasswordMutation.isPending}
			/>
		</>
	);
}

type ResetPasswordDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: User;
	newPassword: string;
	setNewPassword: (password: string) => void;
	onConfirm: () => void;
	isPending: boolean;
};

function ResetPasswordDialog({
	open,
	onOpenChange,
	user,
	newPassword,
	setNewPassword,
	onConfirm,
	isPending,
}: ResetPasswordDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Enter a new password for {user.name}. The password must be at least
						6 characters long.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					<Field>
						<FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
						<Input
							id='newPassword'
							type='password'
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder='Enter new password'
						/>
					</Field>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							onOpenChange(false);
							setNewPassword('');
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={onConfirm}
						disabled={isPending || newPassword.length < 6}
					>
						{isPending ? 'Resetting...' : 'Reset Password'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
