import { CommandContext, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";
import fetch from "node-fetch";
import duration from "pretty-ms";

export default class Stats extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "invite",
			description: "Invite the bot",
		});
	}

export class UserCommand extends Command {
	public async chatInputRun(interaction: CommandInteraction) {
        interaction.reply(`Invite me using [this URL](put url here)`)
	}
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
		  builder
		  .setName(this.name)
		  .setDescription(this.description)
		);
	  }
}
