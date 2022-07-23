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
		// Create a new session and set it as latest, overriding current sessions
		await this.client.db.createHyperbeamSession(room.url, {
			start_url: ctx.options.start_url,
			region: ctx.options.region,
		});
		return ctx.send(
			`Started a multiplayer browser session at ${process.env.VITE_CLIENT_BASE_URL}/${room.url}`,
		);
	}
}
