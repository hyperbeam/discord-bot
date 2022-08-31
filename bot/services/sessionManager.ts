import { ClientToServerEvents, ServerToClientEvents } from "../sharedTypes";
import { Server } from "socket.io";
import { publicObject, PublicRoom } from "../utils/helpers";
import hbSessionAPI from "./hbSessionAPI";
import Database from "./db";
import { Session } from "@prisma/client";

interface SessionManagerProps {
	socketServer: Server;
	db: Database;
}

type ConnectedMember = {
	id?: string;
	socketId: string;
	hbUserId: string;
};

type ExtendedRoom = PublicRoom & {
	connected: ConnectedMember[];
	session: Session;
	controller?: ConnectedMember;
};

export default class SessionManager {
	private activeRooms: Map<string, ExtendedRoom>;
	private socketServer: Server<ClientToServerEvents, ServerToClientEvents>;
	private db: Database;

	constructor(props: SessionManagerProps) {
		this.activeRooms = new Map<string, ExtendedRoom>();
		this.socketServer = props.socketServer;
		this.db = props.db;
	}

	public async join(roomUrl: string, member: ConnectedMember) {
		const room = this.activeRooms.get(roomUrl);
		if (!room) {
			// check if room exists
			const dbRoom = await this.db.getRoom({ url: roomUrl });
			if (dbRoom) {
				// room exists, check session
				const session = await this.db.getLatestSession({ url: roomUrl });
				if (!session) throw new Error("No active session.");

				// session exists, join it
				const roomData = {
					...publicObject.room(dbRoom),
					connected: [member],
					session,
				};
				this.activeRooms.set(roomUrl, roomData);

				// check if first person, if so, make them controller
				this.checkControl(roomUrl, member);
				this.socketServer
					.of(roomUrl)
					.to(member.socketId)
					.emit("joinSuccess", {
						...roomData,
						session: publicObject.session(session),
					});
			} else throw new Error("Room not found.");
		} else {
			// room already registered, check if member is already in it in case of reconnect
			const existingMember = room.connected.findIndex((m) => m.hbUserId === member.hbUserId);
			if (existingMember !== -1) {
				// member is in it, update socket id
				room.connected[existingMember] = member;
			} else {
				// member is not in it, add them
				room.connected.push(member);
			}
			this.activeRooms.set(roomUrl, room);
			this.socketServer.of(roomUrl).emit("roomMembersUpdate", room.connected);
		}
	}

	public async checkControl(roomUrl: string, member: ConnectedMember) {
		const room = this.activeRooms.get(roomUrl);
		// ignore if room doesn't exist or controller exists already or more than one member
		if (room && !room.controller && room.connected.length === 1) {
			if (!member.id) {
				// nobody is logged in, first one gets it
				room.controller = member;
				await hbSessionAPI(room.session).setPermissions(member.hbUserId, {
					control_disabled: false,
				});
				this.socketServer.of(roomUrl).emit("controlTransfer", member);
			}
			// someone is logged in, check if they are the owner
			else if (room.ownerId === member.id) {
				room.controller = member;
				await hbSessionAPI(room.session).setPermissions(member.hbUserId, {
					control_disabled: false,
				});
				this.socketServer.of(roomUrl).emit("controlTransfer", member);
			}
		}
	}
}
