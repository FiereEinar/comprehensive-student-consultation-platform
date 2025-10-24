import LoginForm from '@/components/forms/LoginForm';
import loginGraphic from '../assets/images/login_image.jpg';
import '../assets/login.css';

export default function Login() {
	return (
		<main className='auth-container'>
			<div className='auth-panel auth-panel-bordered'>
				{/* Illustration Panel (white background) */}
				<div className='illustration-section-with-white'>
					<img
						src={loginGraphic}
						alt='Login Illustration'
						className='auth-illustration'
					/>
				</div>
				{/* Form Panel (gradient background) */}
				<div className='form-section-with-gradient'>
					<LoginForm />
				</div>
			</div>
		</main>
	);
}
