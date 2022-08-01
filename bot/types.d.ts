import { Client } from "discord.js";
import Database from "./services/db";
import { Session, SessionData } from "express-session";

// slash-create
export interface BotClient extends Client {
	db: Database;
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