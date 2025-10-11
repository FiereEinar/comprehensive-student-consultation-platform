import z from 'zod';

const MIN_PASSWORD_LEN = 6;

export const createUserSchema = z
	.object({
		name: z.string().min(1, 'Full name is required'),
		institutionalID: z.string().min(1, 'Institutional ID is required'),
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
	name: z.string().min(1, 'Full name is required'),
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

export type CreateUserInputs = z.infer<typeof createUserSchema>;
export type UpdateUserInputs = z.infer<typeof updateUserSchema>;
