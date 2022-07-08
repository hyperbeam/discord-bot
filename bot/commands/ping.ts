import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import { BotClient } from "../types";

export default class Ping extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "ping",
			description: "Replies with pong!",
		});
		this.filePath = __filename;
	}

	async run(ctx: CommandContext) {
		return ctx.send("Pong from slash-create!");
	}
}
