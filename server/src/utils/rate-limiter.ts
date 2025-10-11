import { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { TOO_MANY_REQUESTS } from '../constants/http';

const rateLimiter = new RateLimiterMemory({
	points: 60, // number of requests allowed
	duration: 60, // per seconds
	blockDuration: 120, // block duration
});

export const limiter = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const ip =
			(req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
			req.socket.remoteAddress;

		if (!ip) {
			console.warn('Could not determine client IP address.');
			return next(); // fail-safe: don’t block the request
		}

		await rateLimiter.consume(ip);

		next();
	} catch (error: any) {
		const retrySecs = Math.round(error.msBeforeNext / 1000) || 1;

		res.set({
			'Retry-After': retrySecs,
			'X-RateLimit-Remaining': error.remainingPoints ?? 0,
			'X-RateLimit-Reset': new Date(
				Date.now() + error.msBeforeNext
			).toUTCString(),
		});

		res.status(TOO_MANY_REQUESTS).json({
			message: 'Too many requests. Please try again later.',
			error: error.message,
		});
	}
};
