import { Request } from 'express';

export const getUserRequestInfo = (req: Request) => {
	const xforwarded = req.headers['x-forwarded-for'];
	const forwarded =
		typeof xforwarded === 'string' ? xforwarded : xforwarded?.[0];
	const ip = forwarded ? forwarded.split(',')[0] : req.ip;

	const userAgent = req.headers['user-agent'];

	return { ip, userAgent };
};
