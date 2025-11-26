import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { Switch } from './ui/switch';
import { useUserStore } from '@/stores/user';
import { QUERY_KEYS } from '@/constants';
import { toast } from 'sonner';
import Header from './ui/header';

type NotificationSettings = {
	email: {
		newConsultation: boolean;
		statusUpdates: boolean;
		reminders: boolean;
		systemAnnouncements: boolean;
	};
	inApp: {
		newConsultation: boolean;
		statusUpdates: boolean;
		reminders: boolean;
		systemAnnouncements: boolean;
	};
	quietHours: {
		enabled: boolean;
		start: string;
		end: string;
	};
};

const defaultNotificationSettings: NotificationSettings = {
	email: {
		newConsultation: true,
		statusUpdates: true,
		reminders: true,
		systemAnnouncements: true,
	},
	inApp: {
		newConsultation: true,
		statusUpdates: true,
		reminders: true,
		systemAnnouncements: true,
	},
	quietHours: {
		enabled: false,
		start: '21:00',
		end: '07:00',
	},
};

export default function NotificationSettings() {
	const { user } = useUserStore((state) => state);
	const [settings, setSettings] = useState<NotificationSettings | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.NOTIFICATION_SETTINGS, user?._id],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get(
					`/settings/notification?userID=${user?._id}`
				);
				return res.data.data as NotificationSettings;
			} catch (error: any) {
				if (error.status === 404) {
					try {
						const response = await axiosInstance.post(
							`/settings/notification`,
							{
								user: user?._id,
								...defaultNotificationSettings,
							}
						);
						return response.data.data as NotificationSettings;
					} catch (error: any) {
						toast.error(error.message);
						console.error('Failed to auto create notification settings', error);
					}
				} else {
					toast.error(error.message);
					console.error('Failed to fetch notification settings', error);
				}
			}
		},
	});

	// Sync fetched data into local state
	useEffect(() => {
		if (data) setSettings(data);
	}, [data]);

	if (!settings || isLoading)
		return (
			<div className='flex justify-center items-center py-20'>
				<Loader2 className='size-6 animate-spin' />
			</div>
		);

	const updateSwitch = (path: string[], value: boolean | string) => {
		setSettings((prev) => {
			if (!prev) return prev;

			const updated = { ...prev };
			let ref: any = updated;

			// Navigate into nested object
			for (let i = 0; i < path.length - 1; i++) {
				ref = ref[path[i]];
			}

			ref[path[path.length - 1]] = value;
			return updated;
		});
	};

	const saveSettings = async () => {
		try {
			const res = await axiosInstance.post(`/settings/notification`, {
				user: user?._id,
				...settings,
			});

			// Update local state with updated values from backend
			setSettings(res.data.data);

			toast.success('Notification settings saved!');
		} catch (error: any) {
			console.error(error);
			toast.error('Failed to save settings');
		}
	};

	return (
		<div className='space-y-5'>
			<Header size='md'>Notification Preferences</Header>

			{/* EMAIL NOTIFICATIONS */}
			<Card>
				<CardHeader>
					<CardTitle>Email Notifications</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{Object.entries(settings.email).map(([key, val]) => (
						<div key={key} className='flex justify-between items-center'>
							<span className='capitalize'>
								{key.replace(/([A-Z])/g, ' $1')}
							</span>
							<Switch
								checked={val}
								onCheckedChange={(v) => updateSwitch(['email', key], v)}
							/>
						</div>
					))}
				</CardContent>
			</Card>

			{/* IN-APP NOTIFICATIONS */}
			<Card>
				<CardHeader>
					<CardTitle>In-App Notifications</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{Object.entries(settings.inApp).map(([key, val]) => (
						<div key={key} className='flex justify-between items-center'>
							<span className='capitalize'>
								{key.replace(/([A-Z])/g, ' $1')}
							</span>
							<Switch
								checked={val}
								onCheckedChange={(v) => updateSwitch(['inApp', key], v)}
							/>
						</div>
					))}
				</CardContent>
			</Card>

			{/* QUIET HOURS */}
			<Card>
				<CardHeader>
					<CardTitle>Quiet Hours</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex justify-between items-center'>
						<span>Enable Quiet Hours</span>
						<Switch
							checked={settings.quietHours.enabled}
							onCheckedChange={(v) =>
								updateSwitch(['quietHours', 'enabled'], v)
							}
						/>
					</div>

					{settings.quietHours.enabled && (
						<div className='grid grid-cols-2 gap-4'>
							<div className='flex flex-col'>
								<label className='text-sm mb-1'>Start Time</label>
								<input
									type='time'
									className='border rounded p-2'
									value={settings.quietHours.start}
									onChange={(e) =>
										updateSwitch(['quietHours', 'start'], e.target.value)
									}
								/>
							</div>
							<div className='flex flex-col'>
								<label className='text-sm mb-1'>End Time</label>
								<input
									type='time'
									className='border rounded p-2'
									value={settings.quietHours.end}
									onChange={(e) =>
										updateSwitch(['quietHours', 'end'], e.target.value)
									}
								/>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* SAVE BUTTON */}
			<div className='flex'>
				<Button onClick={saveSettings}>Save Changes</Button>
			</div>
		</div>
	);
}
