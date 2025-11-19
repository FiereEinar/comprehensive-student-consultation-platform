import ResetPasswordForm from './forms/ResetPasswordForm';
import UpdateProfileForm from './forms/UpdateProfileForm';
import { CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet';

type ProfileSettingsSheetProps = {
	trigger: React.ReactNode;
};

export default function ProfileSettingsSheet({
	trigger,
}: ProfileSettingsSheetProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle className='text-2xl font-semibold'>
						Profile Settings
					</SheetTitle>
					<SheetDescription>Make changes to your profile</SheetDescription>
				</SheetHeader>

				<Separator />

				<div className='space-y-8 px-5 pb-5 overflow-auto'>
					<div className='space-y-5'>
						<CardTitle>Profile Information</CardTitle>
						<UpdateProfileForm />
					</div>
					<Separator />
					<div className='space-y-5'>
						<CardTitle>Reset Password</CardTitle>
						<ResetPasswordForm />
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
