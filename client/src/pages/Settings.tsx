import GoogleAccountConnection from '@/components/GoogleAccountConnection';
import NotificationSettings from '@/components/NotificationPreference';

export default function Settings() {
	return (
		<div className='max-w-2xl space-y-5'>
			<NotificationSettings />
			<GoogleAccountConnection />
		</div>
	);
}
