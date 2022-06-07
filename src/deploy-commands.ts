import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readFileSync } from "fs";

const { clientId, token } = JSON.parse(
  readFileSync(new URL("../config.json", import.meta.url), "utf-8")
);

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

const rest = new REST({ version: "9" }).setToken(token);

rest
  .put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
