'use client';
import AuthForm from '@/components/AuthForm';
import { signUpSchema } from '@/lib/validations';

const SignInPage = () => (
	<AuthForm
		type="SIGN_UP"
		schema={signUpSchema}
		defaultValues={{
			email: '',
			password: '',
			fullName: '',
			universityId: 0,
			universityCard: '',
		}}
		onSubmit={() => {}}
	/>
);

export default SignInPage;
