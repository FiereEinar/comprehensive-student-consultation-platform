import z from 'zod';

const MIN_PASSWORD_LEN = 6;

export const createUserSchema = z
	.object({
		firstname: z.string().min(1, 'Firstname is required'),
		lastname: z.string().min(1, 'Lastname is required'),
		email: z.email('Invalid email'),
		password: z
			.string()
			.min(
				MIN_PASSWORD_LEN,
				`Passwords must be atleast ${MIN_PASSWORD_LEN} characters`
			),
		confirmPassword: z
			.string()
			.min(
				MIN_PASSWORD_LEN,
				`Passwords must be atleast ${MIN_PASSWORD_LEN} characters`
			),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const updateUserSchema = z.object({
	firstname: z.string().min(1, 'Firstname is required'),
	lastname: z.string().min(1, 'Lastname is required'),
	email: z.string('Invalid email'),
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

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
