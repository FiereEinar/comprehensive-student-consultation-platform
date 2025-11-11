import React, { useState } from 'react';
import { fetchAvailabilities } from '@/api/instructor';
import { QUERY_KEYS } from '@/constants';
import { formatTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/api/axios';


// Props for instructor ID
type InstructorAvailabilitiesProps = {
    instructorID: string;
    onEdit: (availability: AvailabilityType) => void;
};

type AvailabilityType = {
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    slots: string; // Adjust if your API returns number
    user: string;
};

export default function InstructorAvailabilities({ instructorID, onEdit }: InstructorAvailabilitiesProps) {
    const {
        data: availabilities = [],
        isLoading,
        error,
    } = useQuery<AvailabilityType[]>({
        queryKey: [QUERY_KEYS.INSTRUCTORS_AVAILABILITIES, instructorID],
        queryFn: () => fetchAvailabilities(instructorID),
    });

    const handleDelete = async (availabilityId: string) => {
        if (window.confirm('Are you sure you want to delete this availability?')) {
            try {
                await axiosInstance.delete(`/availability/${availabilityId}`);
                window.location.reload();
            } catch (err) {
                alert('Delete failed!');
            }
        }
    };

    return (
        <div>
            {isLoading && <p>Loading availability...</p>}
            {error && <p>Error loading availabilities</p>}
            <p className='mb-3'>Available Times:</p>
            <ul className="list-disc pl-5">
                {availabilities.map((availability) => (
                    <li key={availability._id} className="flex items-center mb-2 text-sm">
                    <span>
                        {availability.day}: {formatTime(availability.startTime)} - {formatTime(availability.endTime)} ({availability.slots} slots)
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                        type="button"
                        className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs"
                        onClick={() => onEdit(availability)}
                        title="Edit"
                        >
                        Edit
                        </button>
                        <button
                        type="button"
                        className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs mr-30"
                        onClick={() => handleDelete(availability._id)}
                        title="Remove"
                        >
                        Remove
                        </button>
                    </div>
                    </li>
                ))}
            </ul>



        </div>
    );

}
