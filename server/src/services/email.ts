import nodemailer from 'nodemailer';
import { EMAIL_PASS, EMAIL_USER } from '../constants/env';

type EmailOptions = {
	from: string;
	to: string;
	subject: string;
	html: string;
};

export const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS,
	},
});

export const sendMail = async (options: EmailOptions) => {
	return await transporter.sendMail(options);
};
