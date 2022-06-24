declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CLIENT_ID: string;
      DISCORD_CLIENT_SECRET: string;
      DISCORD_BOT_TOKEN: string;
      DISCORD_DEVELOPMENT_GUILD_ID: string;
      HYPERBEAM_API_KEY: string;
      VITE_CLIENT_PORT: string;
      VITE_OAUTH_URL: string;
      client_id: string;
      redirect_uri: string;
      response_type: string;
      scope: string;
    }
  }
}

export {};
