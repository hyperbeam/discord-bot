import { ServerToClientEvents, ClientToServerEvents } from "../../sharedTypes";
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
	public socket: Socket<ServerToClientEvents, ClientToServerEvents>;
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
		this.socket.on("connect", () => console.log(`Connected to ${path}`));
		this.socket.on("disconnect", () => console.log(`Disconnected from ${path}`));
		this.socket.on("connect_error", (error: Error) => console.error(`Error connecting to ${path}: ${error.message}`));
	}

	async join(): Promise<this> {
		this.socket.emit("join", {
			token: this.token,
			hbUserId: this.hbUserId,
		});
		return new Promise((resolve, reject) => {
			this.socket.once("joinSuccess", () => resolve(this));
			this.socket.once("joinFailure", (error: string) => reject(new Error(error)));
		});
	}

	disconnect(): void {
		this.socket.disconnect();
	}

	requestControl() {
		if (!this.controlRequestTimeout) {
			this.controlRequestTimeout = window.setTimeout(() => {
				this.controlRequestTimeout = undefined;
				this.socket.emit("requestControl");
			}, 10 * 1000);
		}
	}

	releaseControl() {
		if (!this.room.controllerId) return;
		if (this.room.controllerId === this.me.id) {
			this.socket.emit("releaseControl");
		}
	}
}
