declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_DEVELOPMENT_GUILD_ID: string;
      HB_API_KEY: string;
      HB_API_ENV: string;
      VITE_CLIENT_ID: string;
      VITE_CLIENT_PORT: string;
      VITE_CLIENT_BASE_URL: string;
      VITE_API_SERVER_PORT: string;
      VITE_API_SERVER_BASE_URL: string;
      DATABASE_URL: string;
    }
  }
}

export { };
