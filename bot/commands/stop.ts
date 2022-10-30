import { Session } from "@prisma/client";
import { CommandContext, SlashCommand, SlashCreator } from "slash-create";

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
		let sessions: Session[] = [];
		try {
			sessions = await endAllSessions(ctx.user.id);
		} catch (err) {
			console.error(err);
		}

		return ctx.send({
			embeds: [
				{
					title: sessions.length
						? `${sessions.length ? `${sessions.length} sessions` : "Session"} stopped successfully`
						: "No session was active",
					fields: [
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
