import expressAsyncHandler from 'express-async-handler';
import { decryptRequestData } from '../utils/encryption';

export const decryptBodyData = expressAsyncHandler(async (req, res, next) => {
	req.body = await decryptRequestData(req.body);
	next();
});
