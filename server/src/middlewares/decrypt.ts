import expressAsyncHandler from 'express-async-handler';
import { decryptRequestData } from '../utils/encryption';

export const decryptBodyData = expressAsyncHandler(async (req, res, next) => {
	// Skip decryption for multipart/form-data requests (file uploads)
	if (req.headers['content-type']?.startsWith('multipart/form-data')) {
		return next();
	}
	req.body = await decryptRequestData(req.body);
	next();
});
