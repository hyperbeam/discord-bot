import { Client } from "discord.js";
import Database from "./services/db";
import { Session } from "express-session";

export interface BotClient extends Client {
	db: Database;
}

declare module "http" {
	interface IncomingMessage {
		session: Session & {
			authenticated: boolean;
		};
	}
}