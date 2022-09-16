import { matchMaker } from "colyseus";
import { CommandContext, SlashCommand, SlashCreator } from "slash-create";
import { getActiveSessions } from "../classes/sessions";
import { BotClient } from "../types";

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
