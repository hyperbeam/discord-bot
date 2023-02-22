import { Session } from "@prisma/client";
import { Client, Room } from "colyseus";
import { customAlphabet } from "nanoid";

import Member from "../schemas/member";
import { RoomState } from "../schemas/room";
import { HyperbeamSession } from "./hyperbeam";
import {
	authenticateUser,
	connectHbUser,
	disposeSession,
	joinSession,
	leaveSession,
	setControl,
	setCursor,
	startSession,
	StartSessionOptions,
} from "./sessions";

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
	maxClients = 50;

	async onCreate(options: StartSessionOptions) {
		this.roomId = options.url || nanoid();
		this.setState(new RoomState());
		this.setPatchRate(40);
		this.setPrivate(true);
		this.state.ownerId = options.ownerId;
		this.state.password = options.password;
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
		this.onMessage<{ type: "setControl"; targetId: string; control: Member["control"] }>(
			"setControl",
			async (client: AuthenticatedClient, message) => {
				setControl({ room: this, client, targetId: message.targetId, control: message.control });
			},
		);
		this.onMessage<{ type: "connectHbUser"; hbId: string }>(
			"connectHbUser",
			async (client: AuthenticatedClient, message) => {
				connectHbUser({ room: this, client, hbId: message.hbId });
			},
		);
	}
}
