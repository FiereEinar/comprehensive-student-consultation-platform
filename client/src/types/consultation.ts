import type { User } from './user';

export type ConsultationStatus =
	| 'pending'
	| 'accepted'
	| 'declined'
	| 'completed';

export type Consultation = {
	_id: string;
	student: User;
	instructor: User;
	scheduledAt: Date;
	status: ConsultationStatus;
	title: string;
	description: string;
	createdAt: Date;
	updatedAt: Date;
};
