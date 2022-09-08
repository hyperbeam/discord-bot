import { Client } from "discord.js";
import Database from "./classes/database";
import { Session, SessionData } from "express-session";

// slash-create
export interface BotClient extends Client {
	db: typeof Database;
}

// express-session
declare module "http" {
	interface IncomingMessage {
		session: Session & Partial<SessionData>;
	}
}

declare module "express-session" {
	export interface SessionData {
		authenticated?: boolean;
	}
}
