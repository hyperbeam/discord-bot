import { Session } from "@prisma/client";
import { Client, Room } from "colyseus";
import { IncomingMessage } from "http";
import { RoomState } from "../schemas/room";
import { HyperbeamSession } from "./hyperbeam";
import { authenticateUser, createRoom, disposeRoom, joinRoom, leaveRoom } from "./sessions";
import db from "./database";

export type AuthenticatedClient = Omit<Client, "auth"> & { auth: Awaited<ReturnType<BotRoom["onAuth"]>> };

export type RoomCreateOptions = {
	ownerId: string;
	region: "NA" | "EU" | "AS";
};

export class BotRoom extends Room<RoomState> {
	session?: Session & { instance: HyperbeamSession };
	guestCount: number = 0;

	async onCreate(options: RoomCreateOptions) {
		this.setState(new RoomState());
		createRoom({ room: this, options, db });
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
		joinRoom({ room: this, client, db });
	}

	onLeave(client: AuthenticatedClient) {
		leaveRoom({
			room: this,
			client,
			db,
		});
	}

	onDispose() {
		disposeRoom({ room: this, db });
	}
}
