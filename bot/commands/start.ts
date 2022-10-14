import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";
import { createSession, endAllSessions } from "../classes/sessions";
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
		try {
			await endAllSessions(ctx.user.id).catch(() => {});
			const session = await createSession({
				region: ctx.options.region || "NA",
				ownerId: ctx.user.id,
			});

			return ctx.send({
				embeds: [
					{
						title: "Started a multiplayer browser session",
						fields: [
							{
								name: "Share this link:",
								value: `${process.env.VITE_CLIENT_BASE_URL}/${session.url}`,
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
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: "Start browsing",
								style: 5,
								url: `${process.env.VITE_CLIENT_BASE_URL}/${session.url}`,
							},
							{
								type: 2,
								label: "View on GitHub",
								style: 5,
								url: process.env.VITE_GITHUB_URL,
							},
						],
					},
				],
			});
		} catch (e) {
			console.error(e);
			return ctx.send({
				embeds: [
					{
						title: "Failed to start a multiplayer browser session",
						description: "Please try again later.",
					},
				],
			});
		}
	}
}
