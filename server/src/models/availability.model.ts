import mongoose from 'mongoose';
import { IUser } from './user.model';

const Schema = mongoose.Schema;

export interface IAvailability {
	user: IUser;
	day: string;
	startTime: string;
	endTime: string;
}

const AvailabilitySchema = new Schema<IAvailability>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	day: { type: String, required: true },
	startTime: { type: String, required: true },
	endTime: { type: String, required: true },
});

const AvailabilityModel = mongoose.model('Availability', AvailabilitySchema);
export default AvailabilityModel;
