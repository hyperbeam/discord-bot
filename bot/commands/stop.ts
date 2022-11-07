import { APIEmbedField, Message, time } from "discord.js";
import { CommandContext, SlashCommand, SlashCreator } from "slash-create";

import database from "../classes/database";
import { endAllSessions } from "../classes/sessions";
import { BotClient } from "../types";
import inviteUrl from "../utils/inviteUrl";

export default class Stop extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "stop",
			description: "Stop a multiplayer browser session",
		});
	}

	async run(ctx: CommandContext) {
		await ctx.defer(true);
		let sessions: Awaited<ReturnType<typeof endAllSessions>> = [];
		try {
			sessions = await endAllSessions(ctx.user.id);
		} catch (err) {
			console.error(err);
		}

		let startCommandId: string = "";
		const startCommand = ctx.creator.commands.find((command) => command.commandName === "start");
		if (startCommand) startCommandId = startCommand.ids.get("global") ?? "";

		const feedbackButtons = [
			{
				type: 2,
				emoji: {
					name: "😀",
				},
				style: 3,
				custom_id: "feedback-good",
			},
			{
				type: 2,
				emoji: {
					name: "😕",
				},
				style: 4,
				custom_id: "feedback-bad",
			},
		];

		if (sessions.length) {
			for (const session of sessions) {
				let existingMessage: Message | undefined = undefined;
				if (session.channelId && session.messageId) {
					if (session.guildId) {
						const guild = this.client.guilds.cache.get(session.guildId);
						if (guild) {
							const channel = guild.channels.cache.get(session.channelId);
							if (channel?.isTextBased()) existingMessage = await channel.messages.fetch(session.messageId);
						}
					} else {
						const channel = this.client.channels.cache.get(session.channelId);
						if (channel?.isTextBased()) existingMessage = await channel.messages.fetch(session.messageId);
					}
				}
				if (existingMessage) {
					const description: string[] = [];
					if (session.endedAt) {
						let sessionInfo = `This session ended ${time(session.endedAt, "R")}`;
						if (session.members && session.members.length) {
							sessionInfo += ` with ${session.members.length} participants`;
						}
						sessionInfo += ".";
						description.push(sessionInfo);
					}

					const fields: APIEmbedField[] = [];
					if (startCommandId)
						fields.push({
							name: "Want to start a new session?",
							value: `Use </start:${startCommandId}> and share the link. It's that easy!`,
						});

					await existingMessage.edit({
						embeds: [
							{
								title: "Thanks for using the bot!",
								description: description.length ? description.join("\n") : undefined,
								fields,
							},
						],
						components: [
							{
								type: 1,
								components: [
									{
										type: 2,
										label: "Add to server",
										style: 5,
										url: inviteUrl,
									},
									{
										type: 2,
										label: "Get help",
										style: 5,
										url: process.env.VITE_DISCORD_SUPPORT_SERVER,
									},
								],
							},
						],
					});
				}
			}
		}

		await ctx.send({
			embeds: [
				{
					title: sessions.length
						? `${sessions.length > 1 ? `${sessions.length} sessions` : "Session"} stopped successfully`
						: "No session was active",
					description: sessions.length ? "Let us know how it went!" : undefined,
				},
			],
			components: sessions.length ? [{ type: 1, components: feedbackButtons }] : [],
			ephemeral: true,
		});

		if (sessions.length) {
			for (const button of feedbackButtons) {
				ctx.registerComponent(button.custom_id, async (interaction) => {
					await interaction.editParent({
						embeds: [
							{
								title: "Thanks for your feedback!",
								description: "We'll use it to improve the bot.",
							},
						],
						components: [],
					});
					sessions.forEach(async (session) => {
						await database.session.update({
							where: { url: session.url },
							data: { feedback: button.custom_id === "feedback-good" ? "good" : "bad" },
						});
					});
				});
			}
		}
	}
}
