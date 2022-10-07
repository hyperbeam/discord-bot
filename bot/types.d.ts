import { Client } from "discord.js";
import Database from "./classes/database";

// slash-create
export interface BotClient extends Client {
	db: typeof Database;
}
