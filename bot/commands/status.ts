import { CommandContext, SlashCommand, SlashCreator } from "slash-create";
import { BotClient } from "../types";
import fetch from "node-fetch";
import duration from "pretty-ms";
import db from "../classes/database";

export default class Status extends SlashCommand<BotClient> {
	constructor(creator: SlashCreator) {
		super(creator, {
			name: "status",
			description: "Display details about the bot",
		});
	}

	async run(ctx: CommandContext) {
		const sessionCount = await db.session.count();
		// const activeSessionCount = await db.session.count({ where: { endedAt: null } });
		const dispatchTime = new Date();
		const regions = ["NA", "EU", "AS"];
		const dispatchStatus = await fetch("https://engine.hyperbeam.com/ok").then((res) =>
			res.ok ? `${new Date().getTime() - dispatchTime.getTime()}ms` : "Offline",
		);
		const regionStatus = await Promise.all(
			regions.map(async (region) => {
				const regionTime = new Date();
				return fetch(`https://engine.hyperbeam.com/vm/ok?reg=${region}`).then((res) => ({
					region,
					status: res.ok ? `${new Date().getTime() - regionTime.getTime()}ms` : "Offline",
				}));
			}),
		);
		await ctx.send({
			embeds: [
				{
					title: "Hyperbeam Bot",
					fields: [
						{
							name: "Status",
							value: `${this.client.guilds.cache.size.toString()} servers joined, ${sessionCount.toString()} sessions created`,
						},
						{
							name: "API Status",
							value: `Online (**Discord**: ${this.client.ws.ping}ms, **Hyperbeam**: ${dispatchStatus})`,
						},
						{
							name: "Regions",
							value: regionStatus.map((r) => `**${r.region}**: ${r.status}`).join(", "),
						},
					],
					footer: {
						text: `Running for ${duration(this.client.uptime!, { compact: true })} using ${Math.round(
							process.memoryUsage().heapUsed / 1024 / 1024,
						)}MB memory`,
					},
				},
			],
		});
	}
}
