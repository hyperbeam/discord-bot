import dotenv from 'dotenv';
import { SlashCreator, GatewayServer } from 'slash-create';
import { Client, Intents } from "discord.js";
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once("ready", () => {
	console.log("Ready!");
});

const creator = new SlashCreator({
	applicationID: process.env.DISCORD_APP_ID!,
	token: process.env.DISCORD_BOT_TOKEN!,
	client
});

creator.on('warn', (message) => console.warn(message));
creator.on('error', (error) => console.error(error));
creator.on('synced', () => console.info('Commands synced!'));
creator.on('commandRun', (command, _, ctx) =>
	console.info(`${ctx.user.username}#${ctx.user.discriminator} (${ctx.user.id}) ran command ${command.commandName}`)
);
creator.on('commandRegister', (command) => console.info(`Registered command ${command.commandName}`));
creator.on('commandError', (command, error) => console.error(`Command ${command.commandName}:`, error));

creator.withServer(new GatewayServer((handler) => client.ws.on("INTERACTION_CREATE", handler)))
	.registerCommandsIn(path.join(__dirname, 'commands'))
	.syncCommands();

client.login(process.env.DISCORD_BOT_TOKEN);
