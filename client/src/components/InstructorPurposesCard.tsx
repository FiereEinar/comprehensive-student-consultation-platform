import { Check, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { fetchInstructorConsultationPurpose } from '@/api/consultation';
import { Input } from './ui/input';
import { useState } from 'react';
import axiosInstance from '@/api/axios';
import { queryClient } from '@/main';

export default function InstructorPurposesCard() {
	const [showInput, setShowInput] = useState(false);
	const { user } = useUserStore((state) => state);
	const [newPurpose, setNewPurpose] = useState('');
	const { data: purpose } = useQuery({
		queryKey: [QUERY_KEYS.INSTRUCTOR_PURPOSES, user?._id],
		queryFn: () => fetchInstructorConsultationPurpose(user?._id || ''),
	});

	const handleAddPurpose = async () => {
		try {
			if (purpose?.purposes.includes(newPurpose.trim().toLowerCase())) {
				return;
			}

			await axiosInstance.patch(`/consultation-purpose/${purpose?._id}`, {
				purposes: [...(purpose?.purposes || []), newPurpose],
			});

			setNewPurpose('');
			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INSTRUCTOR_PURPOSES, user?._id],
			});
		} catch (error) {
			console.error('Error adding purpose:', error);
		}
	};

	const handleRemovePurpose = async (purposeToRemove: string) => {
		try {
			await axiosInstance.delete(`/consultation-purpose/${purpose?._id}`, {
				data: { purpose: purposeToRemove },
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.INSTRUCTOR_PURPOSES, user?._id],
			});
		} catch (error) {
			console.error('Error removing purpose:', error);
		}
	};

	return (
		<Card className='rounded-2xl shadow-sm'>
			<CardHeader>
				<CardTitle className='text-lg font-semibold'>
					<div className='flex justify-between flex-wrap items-center'>
						<p>Accepted Purposes</p>
						<Button
							variant='link'
							className='text-xs '
							onClick={() => setShowInput(!showInput)}
						>
							{showInput ? <Check /> : <Edit />}
						</Button>
					</div>
					{showInput && (
						<div className='flex gap-2 font-normal mt-2'>
							<Input
								type='text'
								className='h-8 text-xs'
								placeholder='Add new purpose'
								value={newPurpose}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										if (newPurpose.trim()) handleAddPurpose();
									}
								}}
								onChange={(e) => setNewPurpose(e.target.value)}
							/>
							<Button
								type='button'
								variant='secondary'
								size='sm'
								className='text-xs'
								onClick={handleAddPurpose}
							>
								Add
							</Button>
						</div>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className='text-sm space-y-2'>
				{purpose &&
					purpose.purposes.map((purpose) => (
						<div
							key={purpose}
							className='flex items-center justify-between gap-2 pr-2'
						>
							<p>{purpose}</p>

							{showInput && (
								<button
									type='button'
									onClick={(e) => {
										e.stopPropagation();
										handleRemovePurpose(purpose);
									}}
									className='text-xs text-destructive hover:underline'
								>
									✕
								</button>
							)}
						</div>
					))}
			</CardContent>
		</Card>
	);
}
