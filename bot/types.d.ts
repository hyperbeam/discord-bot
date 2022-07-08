import { PrismaClient } from "@prisma/client";
import { Client } from "discord.js";

export interface BotClient extends Client {
	db: PrismaClient;
}