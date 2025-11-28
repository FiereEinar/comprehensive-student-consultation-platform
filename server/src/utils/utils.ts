import { Request } from 'express';
import crypto from 'crypto';
import { HASH_ALGORITHM, HASH_ENCODING } from '../constants';

export const getUserRequestInfo = (req: Request) => {
	const xforwarded = req.headers['x-forwarded-for'];
	const forwarded =
		typeof xforwarded === 'string' ? xforwarded : xforwarded?.[0];
	const ip = forwarded ? forwarded.split(',')[0] : req.ip;

	const userAgent = req.headers['user-agent'];

	return { ip, userAgent };
};

export const generateCypto = (length = 32) => {
	return crypto.randomBytes(length).toString(HASH_ENCODING);
};

export const hashCrypto = (data: string) => {
	return crypto.createHash(HASH_ALGORITHM).update(data).digest(HASH_ENCODING);
};

export const validatePassword = (password: string) => {
	const errors: string[] = [];

	if (!/[A-Z]/.test(password))
		errors.push('Password must contain at least 1 uppercase letter.');
	if (!/[a-z]/.test(password))
		errors.push('Password must contain at least 1 lowercase letter.');
	if (!/[0-9]/.test(password))
		errors.push('Password must contain at least 1 number.');
	if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?]/.test(password))
		errors.push('Password must contain at least 1 special character.');

	return errors;
};

export const getPasswordResetEmailTemplate = (resetURL: string) => {
	return `
		<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0;">
			<div style="max-width: 600px; background-color: #ffffff; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden;">
				<div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
					<h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
				</div>
				<div style="padding: 30px;">
					<p style="font-size: 16px; color: #333333;">Hello,</p>
					<p style="font-size: 15px; color: #555555;">
						You recently requested to reset your password for your account. Click the button below to reset it:
					</p>
					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetURL}" 
							style="background-color: #2563eb; color: white; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; display: inline-block;">
							Reset My Password
						</a>
					</div>
					<p style="font-size: 14px; color: #777777;">
						If you didn’t request a password reset, you can safely ignore this email. 
						This link will expire in <strong>1 hour</strong>.
					</p>
					<hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
					<p style="font-size: 12px; color: #999999; text-align: center;">
						© ${new Date().getFullYear()} Comprehensive Student Consultation Platform. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	`;
};
