import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";
import { matchMaker } from "colyseus";
import { StartSessionOptions } from "../classes/sessions";

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
		this.filePath = __filename;
	}

	async run(ctx: CommandContext) {
		const room = await matchMaker.createRoom("room", {
			region: ctx.options.region,
			ownerId: ctx.user.id,
		} as StartSessionOptions);

		const inviteUrl = [
			`https://discord.com/api/oauth2/authorize?client_id=${process.env.VITE_CLIENT_ID}`,
			"permissions=277062470720",
			`redirect_uri=${encodeURIComponent(process.env.VITE_CLIENT_BASE_URL + "/authorize")}`,
			"response_type=code",
			"scope=identify%20email%20bot%20applications.commands",
		].join("&");

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
