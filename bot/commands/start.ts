import { nanoid } from "nanoid";
import { CommandContext, CommandOptionType, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";

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
		// Update user details in the db to recent data
		await this.client.db.upsertUser({
			id: ctx.user.id,
			username: ctx.user.username,
			discriminator: ctx.user.discriminator,
			avatar: ctx.user.avatar,
		});
		// We only keep one room per user for now
		let room = await this.client.db.getRoom({ ownerId: ctx.user.id });
		if (!room)
			room = await this.client.db.createRoom({
				owner: { connect: { id: ctx.user.id } },
				url: nanoid(7),
				name: `${ctx.user.username}'s room`,
			});

		await this.client.db.deleteSessions({ roomId: room.id });
		// Create a new session and set it as latest, overriding current sessions
		await this.client.db.createHyperbeamSession(room.url, {
			start_url: ctx.options.start_url,
			region: ctx.options.region,
		});

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
					title: `${process.env.VITE_CLIENT_BASE_URL}/${room.url}`,
					url: `${process.env.VITE_CLIENT_BASE_URL}/${room.url}`,
					description: "Share this URL with your friends to browse together!",
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
