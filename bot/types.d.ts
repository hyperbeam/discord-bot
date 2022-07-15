import { Client } from "discord.js";
import Database from "./services/db";

export interface BotClient extends Client {
	db: Database;
}