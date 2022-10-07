declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_CLIENT_ID: string;
			DISCORD_CLIENT_SECRET: string;
			DISCORD_BOT_TOKEN: string;
			VITE_DISCORD_INVITE_URL: string;
			VITE_DISCORD_SUPPORT_SERVER: string;
			VITE_GITHUB_URL: string;
			HB_API_KEY: string;
			HB_API_ENV: string;
			VITE_CLIENT_ID: string;
			VITE_CLIENT_PORT: string;
			VITE_CLIENT_BASE_URL: string;
			VITE_CLIENT_SOCKET_URL: string;
			VITE_API_SERVER_PORT: string;
			VITE_API_SERVER_BASE_URL: string;
			DATABASE_URL: string;
		}
	}
}

export {};
