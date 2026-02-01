import z from 'zod';
import { validatePassword } from '../utils/utils';

const MIN_PASSWORD_LEN = 8;

// REGEX for strong password
const strongPasswordRegex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?]).+$/;

const strongPasswordMessage =
	'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.';

export const createUserSchema = z
	.object({
		name: z.string().min(1, 'Full name is required'),
		institutionalID: z.string().min(1, 'Institutional ID is required'),
		email: z.email('Invalid email'),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.superRefine((val, ctx) => {
				const errors = validatePassword(val);
				if (errors.length > 0) {
					errors.forEach((err) =>
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: err,
						}),
					);
				}
			}),
		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

export const updateUserSchema = z.object({
	name: z.string().min(1, 'Full name is required'),
	email: z.email('Invalid email'),
});

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z.string(),
});

export const updateUserPasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),

		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.superRefine((val, ctx) => {
				const errors = validatePassword(val);
				if (errors.length > 0) {
					errors.forEach((err) =>
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: err,
						}),
					);
				}
			}),

		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});
