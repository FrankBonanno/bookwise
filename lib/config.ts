const config = {
	env: {
		prodApiEndpoint: process.env.NEXT_PUBLIC_PROD_API_ENDPOINT!,
		apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT!,
		imageKit: {
			publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
			privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
			urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
		},
		databaseUrl: process.env.DATABASE_URL!,
		upstash: {
			redisUrl: process.env.UPSTASH_REDIS_URL!,
			redisToken: process.env.UPSTASH_REDIS_TOKEN!,
			qStashUrl: process.env.QSTASH_URL!,
			qStashToken: process.env.QSTASH_TOKEN!,
		},
		resendToken: process.env.RESEND_TOKEN!,
	},
};

export default config;
