import React, { useEffect, useState, Fragment } from 'react';
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
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

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
	onSuccess,
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

	// --- YOUR ACTUAL SAVE LOGIC FOR UPDATE ---
	// Handles form submission and calls your updateSingleAvailability controller via API
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!availability) return; // Do nothing if there's nothing to update
		try {
			// This PUT hits your /availability/:id endpoint handled by updateSingleAvailability
			await axiosInstance.put(`/availability/${availability._id}`, fields);
			onClose();
			if (onSuccess) onSuccess();
		} catch (err) {
			alert('Failed to update!');
		}
	};
	// ---------------------------------------------------

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => (!open ? onClose() : undefined)}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Availability</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-3'>
					<div className='flex flex-col'>
						<label className='mb-1 font-medium'>Day:</label>
						<Listbox
							value={fields.day}
							onChange={(d) => setFields((f) => ({ ...f, day: d }))}
						>
							<div className='relative'>
								<Listbox.Button className='border w-full rounded px-2 py-1 bg-white text-left focus:outline-none focus:border-purple-500 transition'>
									{fields.day}
									<span className='absolute inset-y-0 right-0 flex items-center pr-2'>
										<ChevronUpDownIcon
											className='h-5 w-5 text-gray-400'
											aria-hidden='true'
										/>
									</span>
								</Listbox.Button>
								<Transition
									as={Fragment}
									leave='transition ease-in duration-100'
									leaveFrom='opacity-100'
									leaveTo='opacity-0'
								>
									<Listbox.Options className='absolute z-10 mt-1 w-full rounded bg-white shadow-lg'>
										{DAYS.map((day) => (
											<Listbox.Option
												key={day}
												value={day}
												className={({ active, selected }) =>
													`
                                                    relative cursor-pointer select-none py-2 pl-10 pr-4
                                                    ${
																											selected
																												? 'bg-[#ba55d3] text-white'
																												: ''
																										}
                                                    ${
																											active && !selected
																												? 'bg-purple-100 text-purple-900'
																												: ''
																										}
                                                    `
												}
											>
												{({ selected }) => (
													<>
														<span className='block truncate'>{day}</span>
														{selected ? (
															<span className='absolute inset-y-0 left-0 flex items-center pl-3 text-white'>
																<CheckIcon
																	className='h-5 w-5'
																	aria-hidden='true'
																/>
															</span>
														) : null}
													</>
												)}
											</Listbox.Option>
										))}
									</Listbox.Options>
								</Transition>
							</div>
						</Listbox>
					</div>
					<div className='flex flex-col'>
						<label className='mb-1 font-medium'>Start Time:</label>
						<input
							type='time'
							value={fields.startTime}
							onChange={(e) =>
								setFields((f) => ({ ...f, startTime: e.target.value }))
							}
							className='border w-full rounded px-2 py-1'
							required
						/>
					</div>
					<div className='flex flex-col'>
						<label className='mb-1 font-medium'>End Time:</label>
						<input
							type='time'
							value={fields.endTime}
							onChange={(e) =>
								setFields((f) => ({ ...f, endTime: e.target.value }))
							}
							className='border w-full rounded px-2 py-1'
							required
						/>
					</div>
					<div className='flex flex-col'>
						<label className='mb-1 font-medium'>Slots:</label>
						<input
							type='number'
							min={1}
							value={fields.slots}
							onChange={(e) =>
								setFields((f) => ({ ...f, slots: e.target.value }))
							}
							className='border w-full rounded px-2 py-1'
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
