import { Client, Intents } from "discord.js";
import fetch from "node-fetch";
import { hyperbeamApiKey, token } from "../config.json";

const client = new Client({ intents: Intents.FLAGS.GUILDS });

client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (commandName === "start") {
    const startUrl =
      interaction.options.getString("start_url") || "https://duckduckgo.com/";

    const response = await fetch("https://enginetest.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hyperbeamApiKey}`,
      },
      body: JSON.stringify({
        start_url: startUrl,
        offline_timeout: 300,
      }),
    });

    const { embed_url } = await response.json();

    await interaction.reply(embed_url);
  }
});

client.login(token);
