import { useState, type MouseEvent, type ReactNode } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

type ConfirmDeleteDialogProps = {
	title?: string;
	description?: string;
	trigger: ReactNode;
	onConfirm: () => Promise<void> | void;
	onCancel?: () => Promise<void> | void;
	confirmText?: string;
	cancelText?: string;
	successMessage?: string;
	errorMessage?: string;
	icon?: ReactNode;
};

/**
 * Reusable confirmation dialog wrapper for delete actions.
 * Example:
 *
 * <ConfirmDeleteDialog
 *   trigger={<Button variant="link" className="text-red-500">Delete</Button>}
 *   onConfirm={() => handleDelete(id)}
 * />
 */
export default function ConfirmDeleteDialog({
	title = 'Confirm Deletion',
	description = 'Are you sure you want to delete this item? This action cannot be undone.',
	trigger,
	onConfirm,
	onCancel,
	confirmText = 'Delete',
	cancelText = 'Cancel',
	icon,
}: ConfirmDeleteDialogProps) {
	const [loading, setLoading] = useState(false);

	const handleTriggerClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	const handleConfirm = async () => {
		try {
			setLoading(true);
			await onConfirm();
		} catch (error: any) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async () => {
		if (!onCancel) return;
		try {
			setLoading(true);
			await onCancel();
		} catch (error: any) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<div onClick={handleTriggerClick}>{trigger}</div>
			</DialogTrigger>
			<DialogContent className='sm:max-w-[400px]'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						{icon ? icon : <AlertTriangle className='w-5 h-5 text-red-500' />}
						{title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter className='flex justify-end gap-2 mt-4'>
					<Button onClick={handleCancel} variant='outline'>
						{cancelText}
					</Button>
					<Button variant='default' onClick={handleConfirm} disabled={loading}>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
