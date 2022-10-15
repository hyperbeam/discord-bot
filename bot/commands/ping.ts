import { ChatInputCommandInteraction, Message, ApplicationCommandType } from "discord.js";
import ApplicationCommand from "../../../../lib/classes/ApplicationCommand.js";
import BetterClient from "../../../../lib/extensions/BetterClient.js";

export default class Ping extends ApplicationCommand {
    constructor(client: BetterClient) {
        super("ping", client, {
            type: ApplicationCommandType.ChatInput,
            description: `Get the current ping / latency of ${client.config.botName}.`
        });
    }

    override async run(interaction: ChatInputCommandInteraction) {
        const message = (await interaction.reply({
            content: "Ping?",
            fetchReply: true
        })) as unknown as Message;
        const hostLatency =
            message.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(this.client.ws.ping);
        return interaction.editReply({
            content: `Round trip took ${(
                hostLatency + apiLatency
            ).toLocaleString()}ms. (Host latency is ${hostLatency.toLocaleString()} and API latency is ${apiLatency.toLocaleString()}ms)`
        });
    }
}
