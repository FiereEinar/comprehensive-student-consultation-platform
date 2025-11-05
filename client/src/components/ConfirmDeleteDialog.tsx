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
import { toast } from 'sonner';

type ConfirmDeleteDialogProps = {
	title?: string;
	description?: string;
	trigger: ReactNode;
	onConfirm: () => Promise<void> | void;
	confirmText?: string;
	cancelText?: string;
	successMessage?: string;
	errorMessage?: string;
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
	confirmText = 'Delete',
	cancelText = 'Cancel',
	successMessage = 'Item deleted successfully.',
	errorMessage = 'Failed to delete item.',
}: ConfirmDeleteDialogProps) {
	const [loading, setLoading] = useState(false);

	const handleTriggerClick = (e: MouseEvent) => {
		e.stopPropagation();
	};

	const handleConfirm = async () => {
		try {
			setLoading(true);
			await onConfirm();
			// toast.success(successMessage);
		} catch (error: any) {
			console.error(error);
			// toast.error(errorMessage);
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
						<AlertTriangle className='w-5 h-5 text-red-500' />
						{title}
					</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter className='flex justify-end gap-2 mt-4'>
					<Button variant='outline'>{cancelText}</Button>
					<Button
						variant='destructive'
						onClick={handleConfirm}
						disabled={loading}
					>
						{loading ? 'Deleting...' : confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
