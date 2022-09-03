import { ClientToServerEvents, ServerToClientEvents } from "../sharedTypes";
import { Server } from "socket.io";
import { publicObject, PublicRoom } from "../utils/helpers";
import hbSessionAPI from "./hbSessionAPI";
import Database from "./db";
import { Session } from "@prisma/client";

interface SessionManagerProps {
	socketServer: Server<ClientToServerEvents, ServerToClientEvents>;
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

	async getRoom(roomUrl: string): Promise<ExtendedRoom> {
		const room = this.activeRooms.get(roomUrl);
		if (room) return room;
		else {
			const dbRoom = await this.db.getRoom({ url: roomUrl });
			if (dbRoom) {
				// room exists, check session
				const session = await this.db.getLatestSession({ url: roomUrl });
				if (!session) throw new Error("No active session.");

				// session exists, join it
				const roomData = {
					...publicObject.room(dbRoom),
					connected: [],
					session,
				};
				this.activeRooms.set(roomUrl, roomData);
				return roomData;
			} else throw new Error("Room not found.");
		}
	}

	public async join(roomUrl: string, member: ConnectedMember): Promise<ExtendedRoom> {
		const room = await this.getRoom(roomUrl);
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
		return room;
	}

	public async checkControl(roomUrl: string, member: ConnectedMember) {
		const room = this.activeRooms.get(roomUrl);
		if (!room) throw new Error("Room not found.");
		// ignore if room doesn't exist or controller exists already or more than one member
		if (!room.controller && room.connected.length === 1) {
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
		} else if (room.controller && room.controller.id === member.id) {
			// member is the controller already, just needs to be updated
			room.controller = member;
			await hbSessionAPI(room.session).setPermissions(member.hbUserId, {
				control_disabled: false,
			});
		}
	}

	public async setup(roomUrl: string) {
		this.socketServer.of(roomUrl).on("connection", (socket) => {
			socket.on("join", async (member) => {
				console.log("client connected");
				const memberData = {
					...member,
					socketId: socket.id,
				};
				await this.join(roomUrl, memberData)
					.then((room) => {
						socket.emit("joinSuccess", room);
					})
					.catch((err) => {
						socket.emit("joinFailure", err.message);
					});
				await this.checkControl(roomUrl, memberData);
			});
		});
	}
}
