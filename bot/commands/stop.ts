import { CommandContext, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";

export default class Stop extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "stop",
			description: "Stop a multiplayer browser session",
		});
		this.filePath = __filename;
	}

	async run(ctx: CommandContext) {
		// Update user details in the db to recent data
		await this.client.db.upsertUser({
			id: ctx.user.id,
			username: ctx.user.username,
			discriminator: ctx.user.discriminator,
			avatar: ctx.user.avatar,
		});
		// Delete the session from the db
		const room = await this.client.db.getRoom({ ownerId: ctx.user.id });
		if (!room) return ctx.send("Room not found!");
		const sessions = await this.client.db.deleteSessions({ roomId: room.id });
		for (const session of sessions) {
			console.log(`Deleted session ${session.id}`);
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
					title: sessions.length ? "Browser stopped successfully" : "No browser was running",
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
