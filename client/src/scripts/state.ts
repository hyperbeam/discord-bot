import { Manager } from "socket.io-client";
import { get, writable } from "svelte/store";
import { User, Room } from "./types";
import RealtimeRoomConnection from "./socket";
import { HyperbeamIFrame } from "@hyperbeam/web";

export const currentUser = writable<User | null>(null);
export const currentRoom = writable<Room | null>(null);

export const rooms = writable<Room[]>([]);

type SocketIOManager = typeof Manager.prototype;
export const manager = writable<SocketIOManager | null>(null);

export const roomConnection = writable<RealtimeRoomConnection | null>(null);
export const hbSession = writable<HyperbeamIFrame | null>(null);

hbSession.subscribe(session => {
	const token = localStorage.getItem("token");
	const room = get(currentRoom);
	const socketManager = get(manager);
	const me = get(currentUser);
	if (token && session?.userId && room && socketManager && me) {
		roomConnection.set(new RealtimeRoomConnection({
			room,
			hbUserId: session?.userId,
			token, me,
			manager: socketManager,
		}));
		get(roomConnection).join();
	}
});
