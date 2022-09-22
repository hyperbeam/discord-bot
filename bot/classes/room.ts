import { Session } from "@prisma/client";
import { Client, Room } from "colyseus";
import { RoomState } from "../schemas/room";
import { HyperbeamSession } from "./hyperbeam";
import {
	authenticateUser,
	startSession,
	disposeSession,
	joinSession,
	leaveSession,
	StartSessionOptions,
	setCursor,
} from "./sessions";
import Member from "../schemas/member";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("6789BCDFGHJKLMNPQRTWbcdfghjkmnpqrtwz", 8);

export type AuthenticatedClient = Omit<Client, "auth" | "userData"> & {
	auth: Awaited<ReturnType<BotRoom["onAuth"]>>;
	userData: Member;
};

export type AuthOptions = {
	token?: string;
	deviceId?: string;
};

export class BotRoom extends Room<RoomState> {
	session?: Session & { instance: HyperbeamSession };
	guests: number[] = [];
	autoDispose = false;
	multiplayer = true;

	async onCreate(options: StartSessionOptions) {
		this.roomId = nanoid();
		this.setState(new RoomState());
		this.state.ownerId = options.ownerId;
		await this.registerMessageHandlers();
		await startSession({ room: this, options });
	}

	async onAuth(client: Client, options?: AuthOptions) {
		return authenticateUser({
			room: this,
			client,
			token: options?.token,
			deviceId: options?.deviceId,
		});
	}

	async onJoin(client: AuthenticatedClient) {
		await joinSession({ room: this, client });
	}

	async onLeave(client: AuthenticatedClient) {
		await leaveSession({ room: this, client });
	}

	async onDispose() {
		await disposeSession({ room: this });
	}

	async registerMessageHandlers() {
		this.onMessage<{ type: "setCursor"; x: number; y: number }>(
			"setCursor",
			async (client: AuthenticatedClient, message) => {
				setCursor({ room: this, client, x: message.x, y: message.y });
			},
		);
	}
}
