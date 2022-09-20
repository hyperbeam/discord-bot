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
} from "./sessions";
import db from "./database";
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
	ownerId: string;
	multiplayer = true;

	async onCreate(options: StartSessionOptions) {
		this.roomId = nanoid();
		this.ownerId = options.ownerId;
		this.setState(new RoomState());
		await startSession({ room: this, options, db });
	}

	async onAuth(client: Client, options?: AuthOptions) {
		return authenticateUser({
			room: this,
			client,
			db,
			token: options?.token,
			deviceId: options?.deviceId,
		});
	}

	async onJoin(client: AuthenticatedClient) {
		await joinSession({ room: this, client, db });
	}

	async onLeave(client: AuthenticatedClient) {
		await leaveSession({
			room: this,
			client,
			db,
		});
	}

	async onDispose() {
		await disposeSession({ room: this, db });
	}
}
