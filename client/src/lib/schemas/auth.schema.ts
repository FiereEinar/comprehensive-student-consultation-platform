import z from 'zod';

const MIN_PASSWORD_LEN = 8;

const passwordValidation = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.refine((val) => /[A-Z]/.test(val), 'Password must contain at least 1 uppercase letter')
	.refine((val) => /[a-z]/.test(val), 'Password must contain at least 1 lowercase letter')
	.refine((val) => /[0-9]/.test(val), 'Password must contain at least 1 number')
	.refine((val) => /[!@#$%^&*()\-_=+\[\]{};:'",.<>/?]/.test(val), 'Password must contain at least 1 special character');

export const signupSchema = z
	.object({
		name: z.string().min(1, 'Full name is required'),
		institutionalID: z.string().min(1, 'Institutional ID is required'),
		email: z.string().email('Invalid email'),
		password: passwordValidation,
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z.string().min(1, 'Password is required'),
});

export const completeInstructorAccountSchema = z
	.object({
		name: z.string().min(1, 'Full name is required'),
		password: passwordValidation,
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const inviteInstructorSchema = z.object({
	email: z.string().optional(),
	// name: z.string().min(1, 'Name is required'),
});
