import { Client, Room } from "colyseus.js";
import { nanoid } from "nanoid";
import { get } from "svelte/store";

import RoomState from "../schemas/room";
import { currentUser, extendedError, members, room, trackedCursor } from "../store";

const useSSL = import.meta.env.VITE_API_SERVER_BASE_URL.startsWith("https");
const hostname = `${import.meta.env.VITE_API_SERVER_BASE_URL.split("://")[1]}`;
export const client = new Client({ hostname, useSSL, port: useSSL ? 443 : 80 });

interface AuthorizedUser {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	email: string;
	token: string;
}

export async function parseDiscordResponse(code: string, state: string): Promise<AuthorizedUser> {
	if (state !== localStorage.getItem("state")) throw new Error("Invalid OAuth2 state");
	localStorage.removeItem("state");
	const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/authorize/${code}`, {
		headers: {
			"Content-Type": "application/json",
		},
	});
	if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
	const data: AuthorizedUser = (await response.json()) as AuthorizedUser;
	if (!data.id || !data.token) throw new Error("Unable to determine user");
	localStorage.setItem("token", data.token);
	return data;
}

export const oauthUrl = (state: string) =>
	`https://discord.com/oauth2/authorize?client_id=${import.meta.env.VITE_CLIENT_ID!}&redirect_uri=${encodeURIComponent(
		import.meta.env.VITE_CLIENT_BASE_URL!,
	)}%2Fauthorize&response_type=code&scope=identify%20email&state=${state}`;

export function redirectToDiscord(redirectAfterAuth?: string) {
	const redirectRoute = redirectAfterAuth || localStorage.getItem("redirectAfterAuth");
	if (redirectRoute) localStorage.setItem("redirectAfterAuth", redirectRoute);
	const state = nanoid();
	localStorage.setItem("state", state);
	window.location.href = oauthUrl(state);
}

export type PartialRoom = {
	createdAt: string;
	endedAt: string | null;
	owner: {
		username: string;
		discriminator: string;
	};
	active: boolean;
};

export async function connect(url: string, initialAttempt = true) {
	console.log(`${initialAttempt ? "Connecting" : "Reconnecting"} ...`);
	let isConnected = false;
	let roomExists = undefined;
	let i = 1;
	while (!isConnected && roomExists !== false) {
		const sec = Math.min(i, 15);
		try {
			await join(url);
			isConnected = true;
			break;
		} catch (err) {
			if (roomExists === undefined) {
				const response = await fetch(`${import.meta.env.VITE_API_SERVER_BASE_URL}/info/${url}`);
				if (!response.ok) {
					roomExists = false;
					console.log(`Session ${url} not found`);
					extendedError.set({
						code: response.status,
						title: `Session not found`,
						description: [
							"The session you are trying to join does not exist.",
							"Please check the URL and try again.",
						].join("\n"),
					});
					break;
				}
				const roomInfo = (await response.json()) as PartialRoom;
				if (!roomInfo.active) {
					roomExists = false;
					console.log(`Session ${url} is not active`);
					extendedError.set({
						code: response.status,
						title: "This session is not active",
						description: [
							"Late to the party?",
							`Ask ${roomInfo.owner.username}#${roomInfo.owner.discriminator} for a new link or start a new session yourself.`,
						].join("\n"),
					});
					break;
				} else if (roomInfo.active) {
					roomExists = true;
				}
			}
			console.log(`Reconnect attempt ${i} failed. Retrying in ${sec} seconds.`);
		}
		await new Promise((resolve) => setTimeout(resolve, sec * 1000));
		i++;
	}
}

const getToken = () => {
	const token = localStorage.getItem("token");
	if (typeof token === "string" && token !== "undefined") {
		return token;
	}
	return null;
};

const getDeviceId = () => {
	const deviceId = localStorage.getItem("deviceId");
	if (typeof deviceId === "string" && deviceId !== "undefined") {
		return deviceId;
	} else {
		const newDeviceId = nanoid();
		localStorage.setItem("deviceId", newDeviceId);
		return newDeviceId;
	}
};

export async function join(url: string) {
	const roomInstance: Room<RoomState> = await client.joinById(url, { token: getToken(), deviceId: getDeviceId() });
	if (get(room)) get(room).leave();
	room.set(roomInstance);
	console.log(`Joined room ${roomInstance.roomId}`);
	await sendCursorUpdates(roomInstance).catch((err) => console.error(err));
	members.subscribe((currentMembers) => {
		if (get(currentUser)) currentMembers.sort((a) => (a.id === get(currentUser).id ? -1 : 1));
	});
	members.set([...roomInstance.state.members.values()]);
	roomInstance.onStateChange((state) => {
		members.set([...state.members.values()]);
	});
	roomInstance.onMessage("identify", (data: { id: string }) => {
		currentUser.set(get(members).find((m) => m.id === data.id));
	});
	roomInstance.onLeave(async (code) => {
		if (code >= 1001 && code <= 1015) {
			await connect(url, false);
		}
	});
	return roomInstance;
}

let cursorInterval: number | undefined = undefined;

export async function sendCursorUpdates(room: Room<RoomState>, interval = 40) {
	type WebSocketTransport = typeof room.connection.transport & { ws: WebSocket };
	const transport = room.connection.transport as WebSocketTransport;

	if (transport.ws.readyState === WebSocket.OPEN) {
		console.log("Websocket connection open, sending cursor updates");
		window.clearInterval(cursorInterval);
		cursorInterval = window.setInterval(async () => {
			try {
				if (transport.ws.readyState !== WebSocket.OPEN) {
					window.clearInterval(cursorInterval);
					throw new Error("Websocket connection not open.");
				} else room.send("setCursor", get(trackedCursor));
			} catch (err) {
				window.clearInterval(cursorInterval);
			}
		}, interval);
	} else {
		window.clearInterval(cursorInterval);
		throw new Error("Websocket connection not open.");
	}
}
