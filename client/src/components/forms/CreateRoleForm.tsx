import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QUERY_KEYS } from '@/constants';
import z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { createRole } from '@/api/role';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { queryClient } from '@/main';

// Schema for creating a role
const createRoleSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	// permissionIds: z
	// 	.array(z.string())
	// 	.min(1, 'At least one permission is required'),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

type CreateRoleFormProps = {
	title?: string;
};

export default function CreateRoleForm({ title }: CreateRoleFormProps) {
	const {
		control,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<CreateRoleFormValues>({
		resolver: zodResolver(createRoleSchema),
		defaultValues: {
			name: '',
			description: '',
			// permissionIds: [],
		},
	});

	const onSubmit = async (formData: CreateRoleFormValues) => {
		try {
			await createRole(formData);
			toast.success('Role created successfully');
			reset();
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.ROLES],
			});
		} catch (error: any) {
			console.error(error);
			toast.error(error.message ?? 'Failed to create role');
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size='sm' variant='default' className='cursor-pointer'>
					<Plus className='mr-2 h-4 w-4' />
					{title ?? 'Create Role'}
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Create New Role</DialogTitle>
					<DialogDescription>
						Create a new role with specific permissions.
					</DialogDescription>
				</DialogHeader>
				<form
					id='create-role-form'
					onSubmit={handleSubmit(onSubmit)}
					className='space-y-4'
				>
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

					{/* PERMISSIONS - For now, just a placeholder */}
					<div>
						<FieldLabel>Permissions</FieldLabel>
						<p className='text-sm text-muted-foreground'>
							Permissions will be configured in the role details.
						</p>
					</div>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={isSubmitting} variant='outline'>
							Cancel
						</Button>
					</DialogClose>
					<Button disabled={isSubmitting} type='submit' form='create-role-form'>
						Create Role
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
