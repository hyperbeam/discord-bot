import { Session } from "@prisma/client";
import { time } from "discord.js";
import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";

import db from "../classes/database";
import { createSession, endAllSessions, StartSessionOptions } from "../classes/sessions";
import { BotClient } from "../types";

const regions = {
	NA: "North America",
	EU: "Europe",
	AS: "Asia",
};

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
					choices: Object.entries(regions).map(([value, name]) => ({ name, value })),
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
			await ctx.send({
				embeds: [
					{
						title: "Session started!",
						description: `Started ${time(session.createdAt, "R")} by ${ctx.user.mention}`,
						fields: [
							{
								name: "Share the link below",
								value: `${process.env.VITE_CLIENT_BASE_URL}/${session.url}`,
							},
						],
						footer: {
							text: this.getFeatures(session, options),
						},
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
						],
					},
				],
			});

			const startMessage = await ctx.fetch();
			await db.session.update({
				where: {
					url: session.url,
				},
				data: {
					messageId: startMessage.id,
					channelId: ctx.channelID,
					guildId: ctx.guildID,
				},
			});

			return startMessage;
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

	getFeatures(session: Session, options: StartSessionOptions) {
		const features: string[] = [];
		features.push(regions[session.region || "NA"]);

		if (options.width === 1920 && options.height === 1080) {
			features.push("1080p");
		} else {
			features.push("720p");
		}
		if (options.fps === 60) features.push("60fps");
		if (options.kiosk) features.push("kiosk");
		return features.join(" | ");
	}
}
