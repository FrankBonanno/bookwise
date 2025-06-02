import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { sendEmail } from '@/lib/workflow';
import { serve } from '@upstash/workflow/nextjs';
import { eq } from 'drizzle-orm';

type UserState = 'non-active' | 'active';

type InitialData = {
	email: string;
	fullName: string;
};

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const THREE_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 3;
const THIRTY_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 30;

const getUserState = async (email: string): Promise<UserState> => {
	const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

	if (user.length === 0) return 'non-active';

	const lastActivityDate = new Date(user[0].lastActivityDate!);
	const now = new Date();

	const timeDiff = now.getTime() - lastActivityDate.getTime();

	if (timeDiff > THREE_DAYS_IN_SECONDS && timeDiff <= THIRTY_DAYS_IN_SECONDS) return 'non-active';

	return 'active';
};

export const { POST } = serve<InitialData>(async (context) => {
	const { email, fullName } = context.requestPayload;

	// Welcome Email
	await context.run('new-signup', async () => {
		await sendEmail({
			email: email,
			subject: 'Welcome to BookWise!',
			message: `Welcome ${fullName}!`,
		});
	});

	await context.sleep('wait-for-3-days', THREE_DAYS_IN_SECONDS);

	while (true) {
		const state: UserState = await context.run('send-email-non-active', async () => {
			return await getUserState(email);
		});

		if (state === 'non-active') {
			await context.run('send-email-non-active', async () => {
				await sendEmail({
					email: email,
					subject: 'Are you still there?',
					message: `Hey ${fullName}, we miss you! Come visit BookWise again!`,
				});
			});
		} else if (state === 'active') {
			await context.run('send-email-active', async () => {
				await sendEmail({
					email: email,
					subject: 'Welcome back!',
					message: `Hey ${fullName}, thanks for visiting BookWise again! It's good to see you active!`,
				});
			});
		}

		await context.sleep('wait-for-1-month', THIRTY_DAYS_IN_SECONDS);
	}
});
