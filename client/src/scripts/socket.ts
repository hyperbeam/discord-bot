import { Socket, Manager } from "socket.io-client";
import { ActiveRoom, User } from "./types";

interface RoomConnectionProps {
	hbUserId: string;
	manager: Manager;
	token: string;
	room: ActiveRoom;
	me: User;
}

export default class RealtimeRoomConnection {
	private token: string;
	private hbUserId: string;
	public socket: Socket;
	public room: ActiveRoom;
	private controlRequestTimeout: number;
	public me: User;

	constructor(props: RoomConnectionProps) {
		this.room = props.room;
		this.token = props.token;
		this.hbUserId = props.hbUserId;
		this.socket = props.manager.socket(`/${this.room.url}`);
		this.me = props.me;
		this.setupLogs();
	}

	setupLogs() {
		const path = `/${this.room.url}`;
		const events = {
			connect: () => console.log(`Connected to ${path}`),
			disconnect: () => console.log(`Disconnected from ${path}`),
			connect_error: (error: Error) => console.error(`Error connecting to ${path}: ${error.message}`),
			error: (error: Error) => console.error(`Error on ${path}: ${error.message}`),
			reconnect: () => console.log(`Reconnected to ${path}`),
			reconnect_attempt: () => console.log(`Reconnecting to ${path}`),
			reconnect_failed: () => console.log(`Failed to reconnect to ${path}`),
			reconnect_error: (error: Error) => console.error(`Error reconnecting to ${path}: ${error}`),
		};
		for (const event in Object.keys(events)) {
			this.socket.on(event, events[event]);
		}
	}

	async join(): Promise<Socket> {
		this.socket.emit("join", {
			token: this.token,
			hbUserId: this.hbUserId,
		});
		return new Promise((resolve, reject) => {
			this.socket.once("join-success", () => resolve(this.socket));
			this.socket.once("join-error", (error: Error) => reject(error));
		});
	}

	disconnect(): void {
		this.socket.disconnect();
	}

	requestControl() {
		if (!this.controlRequestTimeout) {
			this.controlRequestTimeout = window.setTimeout(() => {
				this.controlRequestTimeout = undefined;
				this.socket.emit("request-control");
			}, 10 * 1000);
		}
	}

	releaseControl() {
		if (this.room.controllerId === this.me.id) {
			this.socket.emit("release-control");
		}
	}

	handleEvents() {
		this.socket.on("members-updated", (members: User[]) => {
			this.room.members = members;
		});
	}
}