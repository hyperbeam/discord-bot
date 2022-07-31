import dotenv from "dotenv";
import { SlashCreator, GatewayServer } from "slash-create";
import { Client, GatewayDispatchEvents, GatewayIntentBits } from "discord.js";
import path from "path";
import { PrismaClient } from "@prisma/client";
import apiServer from "./services/apiServer";
import Database from "./services/db";
import { BotClient } from "./types";

dotenv.config({ path: path.join(__dirname, "../../.env") });
const db = new Database(new PrismaClient());

const port = parseInt(process.env.VITE_API_SERVER_PORT || "3000", 10);
const { httpServer } = apiServer(db);
httpServer.listen(port, () => console.log(`API server listening on port ${port}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] }) as BotClient;
client.db = db;

client.once("ready", () => {
	console.log("Ready!");
});

const creator = new SlashCreator({
	applicationID: process.env.DISCORD_CLIENT_ID!,
	token: process.env.DISCORD_BOT_TOKEN!,
	client,
});

creator.on("warn", (message) => console.warn(message));
creator.on("error", (error) => console.error(error));
creator.on("synced", () => console.info("Commands synced!"));
creator.on("commandRun", (command, _, ctx) =>
	console.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`),
);
creator.on("commandRegister", (command) => console.info(`Registered command ${command.commandName}`));
creator.on("commandError", (command, error) => console.error(`Command ${command.commandName}:`, error));

creator.withServer(new GatewayServer((handler) => client.ws.on(GatewayDispatchEvents.InteractionCreate, handler)))
	.registerCommandsIn(path.join(__dirname, "commands"))
	.syncCommands();

client.login(process.env.DISCORD_BOT_TOKEN);
