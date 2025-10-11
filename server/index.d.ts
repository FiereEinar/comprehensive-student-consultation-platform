import { IUser } from './src/models/mongodb/user.model';

declare global {
	namespace Express {
		interface Request {
			user: IUser;
		}
	}
}
