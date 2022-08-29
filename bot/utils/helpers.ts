import { Room, Session, User } from "@prisma/client";
import fetch, { RequestInit } from "node-fetch";

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
	const ret: any = {};
	keys.forEach(key => {
		ret[key] = obj[key];
	});
	return ret;
}

const publicProperties = {
	room: ["name", "url", "ownerId", "createdAt", "memberCount"] as Array<keyof Room>,
	user: ["id", "username", "discriminator", "avatar", "email"] as Array<keyof User>,
	session: ["sessionId", "embedUrl", "createdAt"] as Array<keyof Session>,
};

export type PublicRoom = {
	[K in keyof Pick<Room, "name" | "url" | "ownerId" | "createdAt" | "memberCount">]: Room[K];
};

export type PublicUser = {
	[K in keyof Pick<User, "id" | "username" | "discriminator" | "avatar" | "email">]: User[K];
};

export type PublicSession = {
	[K in keyof Pick<Session, "sessionId" | "embedUrl" | "createdAt">]: Session[K];
};

export const publicObject = {
	room: (r: Room) => pick(r, ...publicProperties.room) as PublicRoom,
	user: (u: User) => pick(u, ...publicProperties.user) as PublicUser,
	session: (s: Session) => pick(s, ...publicProperties.session) as PublicSession,
};

export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type PickRequired<T> = Pick<T, RequiredKeys<T>>;

type RequestProps = {
	path: string;
	method: Required<RequestInit["method"]>;
	baseUrl: string;
	headers?: RequestInit["headers"];
	authBearer: string;
};

export async function hbApiRequest<ResponseType, RequestBody = any>(props: RequestProps & { body?: RequestBody; }): Promise<ResponseType> {
	const headers = { "Authorization": `Bearer ${props.authBearer}` };
	const response = await fetch(`${props.baseUrl}${props.path}`, {
		method: props.method,
		headers: { ...headers, ...(props.headers || {}) },
		body: props.body ? JSON.stringify(props.body) : undefined,
	});
	const result = await response.json();
	if (!response.ok)
		throw new Error(`${response.status} ${response.statusText}\n${result.code}:${result.message}`);
	return result as unknown as ResponseType;
}
