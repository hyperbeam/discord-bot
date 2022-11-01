import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";

import { createSession, endAllSessions, StartSessionOptions } from "../classes/sessions";
import { BotClient } from "../types";
import inviteUrl from "../utils/inviteUrl";

export default class Start extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "start",
			description: "Start a multiplayer browser session",
			options: [
				{
					type: CommandOptionType.STRING,
					name: "website",
					description: "The website to open in the session",
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
				{
					type: CommandOptionType.STRING,
					name: "extra",
					description: "Extra options 👀",
				},
			],
		});
	}

	async run(ctx: CommandContext) {
		try {
			await endAllSessions(ctx.user.id).catch(() => {});
			const options = {
				region: ctx.options.region || "NA",
				ownerId: ctx.user.id,
				start_url: ctx.options.website,
			} as StartSessionOptions;

			const extraOptions = ctx.options.extra?.split(" ") ?? [];
			if (extraOptions.includes("--1080p")) {
				options.width = 1920;
				options.height = 1080;
			}
			if (extraOptions.includes("--60fps")) {
				options.fps = 60;
			}
			if (extraOptions.includes("--kiosk")) {
				options.kiosk = true;
			}

			const session = await createSession(options);
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
