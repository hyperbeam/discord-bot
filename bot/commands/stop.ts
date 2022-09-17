import { matchMaker } from "colyseus";
import { CommandContext, SlashCommand, SlashCreator } from "slash-create";
import { getActiveSessions } from "../classes/sessions";
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
		const sessions = await getActiveSessions(ctx.user.id);
		if (sessions.length === 0) return ctx.send("You don't have an active session!");

		for (const session of sessions) {
			await matchMaker.remoteRoomCall(session.url, "disconnect");
			console.log(`Stopped session ${session.url}`);
		}

		return ctx.send({
			embeds: [
				{
					title: sessions.length ? "Session stopped successfully" : "No session was active",
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
