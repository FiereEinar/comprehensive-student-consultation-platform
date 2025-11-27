import mongoose from 'mongoose';
import { IUser } from './user.model';
import { Days } from '../utils/date';

const Schema = mongoose.Schema;

export interface IAvailability extends mongoose.Document {
	user: IUser;
	day: Days; // day of the week
	startTime: string; // in 24 hour format
	endTime: string; // in 24 hour format
	slots: number; // number of slots
	mainMeetLink?: string | undefined | null;
}

const AvailabilitySchema = new Schema<IAvailability>({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	day: {
		type: String,
		enum: [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
			'Sunday',
		],
		required: true,
	},
	startTime: { type: String, required: true },
	endTime: { type: String, required: true },
	slots: { type: Number, required: true },
	mainMeetLink: { type: String, default: null },
});

const AvailabilityModel = mongoose.model('Availability', AvailabilitySchema);
export default AvailabilityModel;
