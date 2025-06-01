'use server';

import { signIn } from '@/auth';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';

export const signInWithCredentials = async (params: Pick<AuthCredentials, 'email' | 'password'>) => {
	const { email, password } = params;

	try {
		const result = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			return {
				success: false,
				error: result.error,
			};
		}

		return {
			success: true,
		};
	} catch (error) {
		console.log(error, 'SIGN IN ERROR');
		return {
			success: false,
			error: 'Error signing in.',
		};
	}
};

export const signUp = async (params: AuthCredentials) => {
	const { email, fullName, universityId, password, universityCard } = params;

	const exisitingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

	if (exisitingUser.length > 0) {
		return {
			success: false,
			error: 'User already exists.',
		};
	}

	const hashedPassword = await hash(password, 10);

	try {
		await db.insert(users).values({
			fullName,
			email,
			universityId,
			password: hashedPassword,
			universityCard,
		});

		await signInWithCredentials({ email, password });

		return {
			success: true,
		};
	} catch (error) {
		console.log(error, 'SIGN UP ERROR');
		return {
			success: false,
			error: 'Error signing up.',
		};
	}
};
