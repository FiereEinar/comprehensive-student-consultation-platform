import SignupForm from '@/components/forms/SignupForm';
import signupGraphic from '../assets/images/signup_image.jpg';
import '../assets/signup.css';

export default function Signup() {
	return (
		<main className='auth-container'>
			<div className='auth-panel auth-panel-bordered'>
				{/* Left illustration panel */}
				<div className='illustration-section-with-white'>
					<img
						src={signupGraphic}
						alt='Signup Illustration'
						className='auth-illustration'
					/>
				</div>
				{/* Right gradient form panel */}
				<div className='form-section-with-gradient'>
					<SignupForm />
				</div>
			</div>
		</main>
	);
}
