import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/api/axios';
import { toast } from 'sonner';
import { Label } from '../ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { queryClient } from '@/main';
import { QUERY_KEYS } from '@/constants';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

type AvailabilityType = {
	_id: string;
	day: string;
	startTime: string;
	endTime: string;
	slots: string;
	user: string;
};

interface EditAvailabilityModalProps {
	availability: AvailabilityType | null;
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function EditAvailabilityModal({
	availability,
	open,
	onClose,
}: EditAvailabilityModalProps) {
	const [fields, setFields] = useState({
		day: DAYS[0],
		startTime: '',
		endTime: '',
		slots: '',
	});

	useEffect(() => {
		if (availability) {
			setFields({
				day: availability.day || DAYS[0],
				startTime: availability.startTime,
				endTime: availability.endTime,
				slots: availability.slots,
			});
		}
	}, [availability]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!availability) return; // Do nothing if there's nothing to update
		try {
			await axiosInstance.put(`/availability/${availability._id}`, fields);
			onClose();
			toast.success('Availability updated');
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, availability.user],
			});
		} catch (err) {
			toast.error('Failed to update availability');
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => (!open ? onClose() : undefined)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Availability</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Day Selection */}
					<div className='flex flex-col space-y-1.5'>
						<Label htmlFor='day'>Day</Label>
						<Select
							value={fields.day}
							onValueChange={(d) => setFields((f) => ({ ...f, day: d }))}
						>
							<SelectTrigger className='w-full' id='day'>
								<SelectValue placeholder='Select day' />
							</SelectTrigger>
							<SelectContent>
								{DAYS.map((day) => (
									<SelectItem key={day} value={day}>
										{day}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Start Time */}
					<div className='flex flex-col space-y-1.5'>
						<Label htmlFor='startTime'>Start Time</Label>
						<Input
							id='startTime'
							type='time'
							value={fields.startTime}
							onChange={(e) =>
								setFields((f) => ({ ...f, startTime: e.target.value }))
							}
							required
						/>
					</div>

					{/* End Time */}
					<div className='flex flex-col space-y-1.5'>
						<Label htmlFor='endTime'>End Time</Label>
						<Input
							id='endTime'
							type='time'
							value={fields.endTime}
							onChange={(e) =>
								setFields((f) => ({ ...f, endTime: e.target.value }))
							}
							required
						/>
					</div>

					{/* Slots */}
					<div className='flex flex-col space-y-1.5'>
						<Label htmlFor='slots'>Slots</Label>
						<Input
							id='slots'
							type='number'
							min={1}
							value={fields.slots}
							onChange={(e) =>
								setFields((f) => ({ ...f, slots: e.target.value }))
							}
							required
						/>
					</div>
					<DialogFooter>
						<Button type='submit'>Save</Button>
						<DialogClose asChild>
							<Button type='button' variant='outline'>
								Cancel
							</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
