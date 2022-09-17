import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";
import { matchMaker } from "colyseus";
import { StartSessionOptions } from "../classes/sessions";
import inviteUrl from "../utils/inviteUrl";

export default class Start extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "start",
			description: "Start a multiplayer browser session",
			options: [
				{
					type: CommandOptionType.STRING,
					name: "start_url",
					description: "The initial URL that is set in the browser",
				},
				{
					type: CommandOptionType.STRING,
					name: "region",
					description: "The region to use for the session",
					choices: [
						{
							name: "North America",
							value: "NA",
						},
						{
							name: "Europe",
							value: "EU",
						},
						{
							name: "Asia",
							value: "AS",
						},
					],
				},
			],
		});
	}

	async run(ctx: CommandContext) {
		const room = await matchMaker.createRoom("room", {
			region: ctx.options.region || "NA",
			ownerId: ctx.user.id,
		} as StartSessionOptions);

		return ctx.send({
			embeds: [
				{
					title: "Started a multiplayer browser session!",
					description: "Share the link below with your friends to browse together!",
					fields: [
						{
							name: "Start browsing at",
							value: `${process.env.VITE_CLIENT_BASE_URL}/${room.roomId}`,
						},
						{
							name: "Love the Discord bot?",
							value: `[Invite it](${inviteUrl}) to your server, star us on [GitHub](${process.env.VITE_GITHUB_URL}) and help spread the word!`,
						},
						{
							name: "Need help?",
							value: `Join the [support server](${process.env.VITE_DISCORD_SUPPORT_SERVER}).`,
						},
					],
				},
			],
		});
	}
}
