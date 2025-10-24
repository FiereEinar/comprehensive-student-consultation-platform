import SignupForm from '@/components/forms/SignupForm';
import signupGraphic from '../assets/images/signup_image.jpg';
import { Card, CardContent } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';
// import '../assets/signup.css';

export default function Signup() {
	return (
		<main className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10 w-full'>
			<div className='w-full max-w-sm md:max-w-4xl'>
				<div className='flex flex-col gap-6'>
					<Card className='overflow-hidden p-0 '>
						<CardContent className='grid p-0 md:grid-cols-2 w-full'>
							<div className='bg-white relative hidden md:block'>
								<img
									src={signupGraphic}
									alt='Signup Illustration'
									className='w-full h-full object-contain object-center dark:brightness-[0.2] dark:grayscale'
								/>
							</div>
							<SignupForm />
						</CardContent>
					</Card>
					<FieldDescription className='px-6 text-center'>
						By clicking continue, you agree to our{' '}
						<a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
					</FieldDescription>
				</div>
			</div>
		</main>
	);
}
