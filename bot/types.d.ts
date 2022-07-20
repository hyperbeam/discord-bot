import { Client } from "discord.js";
import Database from "./services/db";
import { Session } from "express-session";

// slash-create
export interface BotClient extends Client {
	db: Database;
}

// express-session
declare module "http" {
	interface IncomingMessage {
		session: Session & {
			authenticated: boolean;
		};
	}
}