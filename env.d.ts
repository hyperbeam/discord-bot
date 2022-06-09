declare global {
  namespace NodeJS {
    interface ProcessEnv {
      HYPERBEAM_API_KEY: string;
      BOT_TOKEN: string;
      BOT_CLIENT_ID: string;
    }
  }
}

export {};
