import z from 'zod';

export const AVAILABLE_DAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
];

export const createAvilabilitySchema = z.object({
    days: z.array(z.enum(AVAILABLE_DAYS)).min(1, 'Select at least one day'), // allows multi-day selection
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    slots: z.string().min(1, 'Slots is required'),
    schoolYear: z.string().min(1, 'School year is required'),
    semester: z.string().min(1, 'Semester is required'),
})
.refine(
    (data) => {
        // Use first selected day for validation
        const startTime = new Date(`1970-01-01T${data.startTime}`);
        const endTime = new Date(`1970-01-01T${data.endTime}`);
        // If endTime < startTime, assume it crosses midnight (e.g., 11:30 PM -> 12:00 AM)
        if (endTime < startTime) {
            return true; // Valid: crosses midnight
        }
        return startTime < endTime;
    },
    {
        message: 'Start time must be before end time',
        path: ['endTime'],
    }
)
.refine(
    (data) => {
        // Check that times are within working hours (5 AM to 10 PM)
        const startTime = new Date(`1970-01-01T${data.startTime}`);
        const endTime = new Date(`1970-01-01T${data.endTime}`);
        const workingStart = new Date(`1970-01-01T05:00`);
        const workingEnd = new Date(`1970-01-01T22:00`);
        
        // Both start and end must be within working hours
        return startTime >= workingStart && startTime <= workingEnd && 
               endTime >= workingStart && endTime <= workingEnd;
    },
    {
        message: 'Availability must be between 5:00 AM and 10:00 PM',
        path: ['startTime'],
    }
)
.refine(
    (data) => {
        const slotsInt = parseInt(data.slots);
        return slotsInt > 0;
    },
    {
        message: 'Slots must be greater than 0',
        path: ['slots'],
    }
);
