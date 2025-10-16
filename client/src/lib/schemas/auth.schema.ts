import z from 'zod';

const MIN_PASSWORD_LEN = 6;

export const signupSchema = z
	.object({
		name: z.string().min(1, 'Full name is required'),
		institutionalID: z.string().min(1, 'Institutional ID is required'),
		email: z.string().email('Invalid email'),
		password: z.string().min(6, 'Password must be atleast 6 characters'),
		confirmPassword: z.string().min(6, 'Password must be atleast 6 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z
		.string()
		.min(
			MIN_PASSWORD_LEN,
			`Passwords must be atleast ${MIN_PASSWORD_LEN} characters`
		),
});
