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
				style: 2,
				custom_id: "feedback-good",
			},
			{
				type: 2,
				emoji: {
					name: "🫤",
				},
				style: 2,
				custom_id: "feedback-neutral",
			},
			{
				type: 2,
				emoji: {
					name: "🙁",
				},
				style: 2,
				custom_id: "feedback-bad",
			},
		];

		const startHintFields: APIEmbedField[] = [];
		if (startCommandId)
		startHintFields.push({
				name: "Want to browse the web together?",
				value: `Use </start:${startCommandId}> and share the link. It's that easy!`,
			});

		const supportButtons = [
			{
				type: 2,
				label: "Add to Server",
				style: 5,
				url: inviteUrl,
			},
			{
				type: 2,
				label: "Get support",
				style: 5,
				url: process.env.VITE_DISCORD_SUPPORT_SERVER,
			},
		]

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
						let sessionInfo = `This multiplayer browser was stopped at ${time(session.endedAt)}`;
						if (session.members && session.members.length) {
							sessionInfo += ` with ${session.members.length} participants`;
						}
						sessionInfo += ".";
						description.push(sessionInfo);
					}

					await existingMessage.edit({
						embeds: [
							{
								title: "Thanks for using the bot!",
								description: description.length ? description.join("\n") : undefined,
								fields: startHintFields,
							},
						],
						components: [
							{
								type: 1,
								components: supportButtons,
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
						? `Stopped ${sessions.length > 1 ? `${sessions.length} multiplayer browsers` : "multiplayer browser"}`
						: "No multiplayer browser was active",
					fields: !sessions.length ? startHintFields : [{
						name: "Let us know how it went!",
						value: "Your feedback helps us improve the bot.",
					}],
				},
			],
			components: [{ type: 1, components: sessions.length ? feedbackButtons:supportButtons }],
			ephemeral: true,
		});

		if (sessions.length) {
			for (const button of feedbackButtons) {
				ctx.registerComponent(button.custom_id, async (interaction) => {
					await interaction.editParent({
						embeds: [
							{
								title: "Thanks for your feedback!",
								description: "Join the support server to suggest new features, talk to the developers and more.",
							},
						],
						components: [{
							type: 1,
							components: supportButtons,
						}],
					});
					sessions.forEach(async (session) => {
						await database.session.update({
							where: { url: session.url },
							data: { feedback: button.custom_id.replace("feedback-", "") },
						});
					});
				});
			}
		}
	}
}
