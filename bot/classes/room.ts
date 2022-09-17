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

export class BotRoom extends Room<RoomState> {
	session?: Session & { instance: HyperbeamSession };
	guests: number[] = [];
	autoDispose = false;

	async onCreate(options: StartSessionOptions) {
		this.roomId = nanoid();
		this.setState(new RoomState());
		await startSession({ room: this, options, db });
	}

	async onAuth(client: Client, options?: { token?: string }) {
		return authenticateUser({
			room: this,
			client,
			db,
			token: options?.token,
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
