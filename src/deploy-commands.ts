import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import "dotenv/config";

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!"),
  new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a multiplayer browser session")
    .addStringOption((option) =>
      option
        .setName("start_url")
        .setDescription("The initial URL that is set in the browser")
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

rest
  .put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
