import axios from 'axios';
import { RECAPTCHA_SECRET_KEY } from '../constants/env';

export const verifyRecaptcha = async (recaptchaResponse: string) => {
	try {
		const response = await axios.post(
			'https://www.google.com/recaptcha/api/siteverify',
			null,
			{
				params: {
					secret: RECAPTCHA_SECRET_KEY,
					response: recaptchaResponse,
				},
			}
		);

		return response.data.success;
	} catch (error) {
		console.error('Error verifying reCAPTCHA:', error);
		return false;
	}
};
