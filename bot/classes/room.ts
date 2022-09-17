import { Session } from "@prisma/client";
import { Client, Room } from "colyseus";
import { IncomingMessage } from "http";
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
	guestCount: number = 0;
	autoDispose = false;

	async onCreate(options: StartSessionOptions) {
		this.roomId = nanoid();
		this.setState(new RoomState());
		startSession({ room: this, options, db });
	}

	async onAuth(client: Client, _options: any, req?: IncomingMessage | undefined) {
		return authenticateUser({
			room: this,
			client,
			db,
			token: req?.headers?.authorization?.toString().split(" ")[1],
		});
	}

	onJoin(client: AuthenticatedClient) {
		joinSession({ room: this, client, db });
	}

	onLeave(client: AuthenticatedClient) {
		leaveSession({
			room: this,
			client,
			db,
		});
	}

	onDispose() {
		disposeSession({ room: this, db });
	}
}
